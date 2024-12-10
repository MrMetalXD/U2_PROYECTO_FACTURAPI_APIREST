const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const { sendEmail } = require('../utils/mailjet');
const stripe = require('../apis/stripe');
const { facturapi } = require('../apis/facturapi');
const { subirArchivoCloudinary } = require('../apis/cloudinaryService');
const axios = require('axios');
const fs = require('fs');

// Función para validar stock
async function validateStock(productId, quantity) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Producto no encontrado.');
  }
  if (product.stock < quantity) {
    throw new Error(`No hay suficiente stock para el producto: ${product.name}`);
  }
  return product;
}

// Función para actualizar los totales del carrito
function updateCartTotals(cart) {
  // Asegurarse de que cart.productos es un array válido
  if (!cart.productos || !Array.isArray(cart.productos)) {
      cart.productos = []; // Inicializar si es undefined
  }

  // Calcular el subtotal
  const subtotal = cart.productos.reduce((sum, item) => {
      const itemTotal = parseFloat(item.producto.price) * parseInt(item.cantidad);
      return !isNaN(itemTotal) ? sum + itemTotal : sum;
  }, 0);

  // Calcular el IVA (asumiendo una tasa del 16%)
  const iva = subtotal * 0.16;

  // Calcular el total
  const total = subtotal + iva;

  // Asignar los totales al carrito
  cart.subtotal = subtotal;
  cart.iva = iva;
  cart.total = total;

  return cart.save(); // Guardar el carrito actualizado
}




const cartService = { 
  // Obtener todos los carritos
  getCarts: async () => {
    return await Cart.find().populate('usuario').populate('productos.producto');
  },

  // Obtener un carrito por su ID
  getCartById: async (id_carrito) => {
    const cart = await Cart.findById(id_carrito).populate('usuario').populate('productos.producto');
    if (!cart) {
      throw new Error('Carrito no encontrado.');
    }
    return cart;
  },
  
  // Obtener historial de carritos cerrados
  LeerHistoria: async (usuario) => {
    return await Cart.find({ usuario, estatus: 'cerrado' }).populate('productos.producto');
  },

  // Crear un nuevo carrito
  CrearCarrito: async (usuario) => {
    const newCart = new Cart({ usuario, productos: [] });
    await newCart.save();
    return await Cart.findById(newCart._id).populate('usuario');
  },

  // Agregar producto al carrito
  async addProductToCart(cartId, productoId, cantidad) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado.');

    if (!cart.productos) cart.productos = []; // Inicializar el array productos si no existe

    const product = await Product.findById(productoId);
    if (!product) throw new Error('Producto no encontrado.');
    if (product.stock < cantidad) throw new Error(`No hay suficiente stock para el producto: ${product.name}`);

    // Verificar si el producto ya está en el carrito
    const existingProduct = cart.productos.find(item => item.producto.toString() === productoId.toString());

    if (existingProduct) {
        existingProduct.cantidad += cantidad; // Si ya existe, actualizar la cantidad
    } else {
        cart.productos.push({ producto: productoId, cantidad }); // Si no, agregar nuevo producto
    }

    // Actualizar el stock del producto
    product.stock -= cantidad;
    await product.save();

    // Actualizar los totales del carrito
    await updateCartTotals(cart);

    // Guardar los cambios en el carrito
    await cart.save();

    return await Cart.findById(cartId).populate('productos.producto'); // Devolver el carrito actualizado
},


  // Actualizar los productos en el carrito
  updateCartProducts: async (cartId, productos) => {
    const cart = await Cart.findById(cartId);
  
    if (!cart) {
      throw new Error('Carrito no encontrado.');
    }
  
    // Validar productos y calcular subtotales
    let subtotal = 0;
    cart.productos = await Promise.all(
      productos.map(async (item) => {
        const product = await Product.findById(item.productoId);
        if (!product) {
          throw new Error(`Producto no encontrado: ${item.productoId}`);
        }
        if (product.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para el producto: ${product.name}`);
        }
        if (typeof product.price !== 'number' || typeof item.cantidad !== 'number') {
          throw new Error(`Precio o cantidad inválidos para el producto: ${product.name}`);
        }
        subtotal += product.price * item.cantidad;
  
        return {
          producto: product._id,
          cantidad: item.cantidad,
        };
      })
    );
  ``
    // Actualizar totales
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
  
    cart.subtotal = subtotal || 0; // Garantizar un valor numérico
    cart.iva = iva || 0;
    cart.total = total || 0;
  
    // Guardar el carrito actualizado
    await cart.save();
  
    return await Cart.findById(cartId).populate('productos.producto'); // Devolver el carrito con los productos poblados
  },

  deleteCart: async (cartId) => {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado.');
    
    await cart.remove();
    return { message: 'Carrito eliminado exitosamente.' };
  },

  deleteProductFromCart: async (cartId, productoId) => {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado.');
    
    cart.productos = cart.productos.filter(item => !item.producto.equals(productoId));
    await updateCartTotals(cart);  // Actualiza los totales
    await cart.save();
    return await Cart.findById(cartId).populate('productos.producto');
  },
  
  

  // Eliminar producto del carrito
  EliminarProd: async (id_carrito, productoId) => {
    const cart = await Cart.findById(id_carrito);
    if (!cart) throw new Error('Carrito no encontrado.');
    
    cart.productos = cart.productos.filter((item) => !item.producto.equals(productoId));
    await updateCartTotals(cart);  // Actualiza los totales
    await cart.save();
    return await Cart.findById(id_carrito).populate('productos.producto');
  },

  // Procesar pago y cerrar el carrito
  ProcesarPagoYCerrarCarrito: async (id_carrito, paymentMethodId) => {
    const cart = await Cart.findById(id_carrito);
    if (!cart) throw new Error('Carrito no encontrado.');
    if (cart.estatus !== 'activo') {
      throw new Error('El carrito ya está cerrado.');
    }
  
    // Simular procesamiento de pago
    const paymentResult = await stripe.processPayment(paymentMethodId, cart.total);
  
    if (paymentResult.status !== 'succeeded') {
      throw new Error('El pago falló.');
    }
  
    cart.estatus = 'cerrado';
    cart.paymentStatus = 'paid';
    cart.fecha_cierre = new Date();
    await cart.save();
  
    // Opcional: enviar correo de confirmación
    await sendEmail(cart.usuario.email, 'Confirmación de compra', 'Gracias por tu compra.');
  
    return { message: 'Pago procesado y carrito cerrado.', cart };
  },
  

  // Emitir factura
  EmitirFactura: async (id_carrito) => {
    const cart = await Cart.findById(id_carrito).populate('productos.producto usuario');
    if (!cart) throw new Error('Carrito no encontrado.');
    if (cart.estatus !== 'cerrado') {
      throw new Error('El carrito debe estar cerrado para emitir factura.');
    }
  
    // Generar datos de factura
    const invoiceData = {
      customer: { id: cart.usuario.facturapiId },
      items: cart.productos.map((item) => ({
        product: item.producto.facturapiId,
        quantity: item.cantidad,
      })),
      payment_form: '01', // Ejemplo: Pago en una sola exhibición
    };
  
    const invoice = await facturapi.invoices.create(invoiceData);
  
    // Descargar y subir la factura
    const pdfPath = `/tmp/factura_${cart._id}.pdf`;
    await axios({ url: invoice.pdf, responseType: 'stream' }).then(
      (response) => new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(pdfPath);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      })
    );
  
    const cloudinaryResponse = await subirArchivoCloudinary(pdfPath);
    fs.unlinkSync(pdfPath); // Eliminar archivo temporal
  
    return { message: 'Factura emitida correctamente.', cloudinaryResponse };
  },
  

};

module.exports = cartService;
