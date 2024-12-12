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
  function updateCartTotals(cart) {
    if (!cart.productos || !Array.isArray(cart.productos)) {
      cart.productos = []; // Inicializar si es undefined
    }
  
    const subtotal = cart.productos.reduce((sum, item) => {
      const itemTotal = parseFloat(item.producto.price) * parseInt(item.cantidad);
      return !isNaN(itemTotal) ? sum + itemTotal : sum;
    }, 0);
  
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
  
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

  // Función para agregar un producto al carrito
  async agregarProductoAlCarrito(id_carrito, productoId, cantidad) {
    const cart = await Cart.findById(id_carrito);
    if (!cart) throw new Error('Carrito no encontrado.');
  
    if (isNaN(cantidad) || cantidad <= 0) {
      throw new Error('Cantidad no válida');
    }
  
    const product = await Product.findById(productoId);
    if (!product) throw new Error('Producto no encontrado.');
  
    if (product.stock < cantidad) {
      throw new Error(`No hay suficiente stock para el producto: ${product.name}`);
    }
  
    const existingProduct = cart.productos.find((item) => item.producto.toString() === productoId.toString());
    if (existingProduct) {
      existingProduct.cantidad += cantidad;
    } else {
      cart.productos.push({ producto: productoId, cantidad });
    }
  
    await updateCartTotals(cart);
    await cart.save();
  
    return cart.populate('productos.producto');
  },  
// Actualizar productos en el carrito

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
    updateCartProducts: async (cartId, productos) => {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error('Carrito no encontrado.');
      }
    
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
    
          if (isNaN(item.cantidad) || item.cantidad <= 0 || isNaN(product.price)) {
            throw new Error(`Precio o cantidad inválidos para el producto: ${product.name}`);
          }
    
          subtotal += product.price * item.cantidad;
    
          return {
            producto: product._id,
            cantidad: item.cantidad,
          };
        })
      );
    
      const iva = subtotal * 0.16;
      const total = subtotal + iva;
    
      cart.subtotal = subtotal || 0;
      cart.iva = iva || 0;
      cart.total = total || 0;
    
      await cart.save();
    
      return await Cart.findById(cartId).populate('productos.producto');
    },    
    // Procesar pago y cerrar carrito
    async ProcesarPagoYCerrarCarrito(id_carrito, paymentMethodId) {
      console.log('ID recibido:', id_carrito);
    
      // Validar entrada
      if (!id_carrito || !paymentMethodId) {
        throw new Error('Faltan datos obligatorios: id_carrito o paymentMethodId.');
      }
    
      // Cargar carrito
      const cart = await Cart.findById(id_carrito).populate('usuario').populate('productos.producto');
      console.log('Carrito encontrado:', cart);
    
      if (!cart) throw new Error('Carrito no encontrado.');
      if (cart.paymentStatus === 'paid' || cart.estatus === 'cerrado') {
        throw new Error('El carrito ya fue pagado o está cerrado.');
      }
    
      const totalInCents = Math.round(cart.total * 100);
      console.log('Total a pagar (en centavos):', totalInCents);
    
      try {
        // Crear PaymentIntent en Stripe
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalInCents,
          currency: 'mxn',
          payment_method: paymentMethodId,
          confirm: true,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never',
          },
          receipt_email: cart.usuario.email,
        });
    
        // Validar y actualizar stock de productos
        const session = await Cart.startSession();
        session.startTransaction();
    
        for (const item of cart.productos) {
          const product = await Product.findById(item.producto._id).session(session);
          if (!product || product.stock < item.cantidad) {
            throw new Error(`No hay suficiente stock para el producto: ${item.producto.name}`);
          }
          product.stock -= item.cantidad;
          await product.save({ session });
        }
    
        // Actualizar el carrito
        cart.estatus = 'cerrado';
        cart.paymentStatus = 'paid';
        cart.fecha_cierre = new Date();
        await cart.save({ session });
    
        // Confirmar transacción
        await session.commitTransaction();
        session.endSession();
    
        // Enviar correo de confirmación
        const user = cart.usuario;
        const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
    .header { background-color: #007BFF; color: #ffffff; text-align: center; padding: 20px; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 20px; }
    .content h2 { color: #333333; }
    .product-list { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .product-list th, .product-list td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    .footer { background-color: #007BFF; color: #ffffff; text-align: center; padding: 10px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Gracias por tu compra</h1>
    </div>
    <div class="content">
      <h2>Hola ${user.nombreCompleto},</h2>
      <p>Tu compra se ha completado exitosamente. Aquí tienes los detalles:</p>
      <table class="product-list">
        <thead>
          <tr><th>Producto</th><th>Cantidad</th><th>Precio</th></tr>
        </thead>
        <tbody>
          ${cart.productos.map(item => `<tr><td>${item.producto.name}</td><td>${item.cantidad}</td><td>$${item.producto.price.toFixed(2)}</td></tr>`).join('')}
        </tbody>
      </table>
      <p><strong>Total:</strong> $${cart.total.toFixed(2)}</p>
    </div>
    <div class="footer">
      <p>Gracias por tu preferencia.</p>
      <p>&copy; 2024 Tu Empresa</p>
    </div>
  </div>
</body>
</html>
        `;
        await sendEmail(user.email, 'Confirmación de Compra', emailContent);
    
        return {
          message: 'Pago procesado y carrito cerrado exitosamente.',
          paymentId: paymentIntent.id,
          carrito: cart,
        };
      } catch (error) {
        console.error('Error procesando el pago:', error);
    
        // Revertir transacciones en caso de error
        await session?.abortTransaction();
        session?.endSession();
    
        // Actualizar estado del carrito a 'failed'
        cart.paymentStatus = 'failed';
        await cart.save();
    
        throw new Error('Error procesando el pago: ' + error.message);
      }
    },    
    // Emitir factura
    async EmitirFactura(_, { id_carrito }) {
      const cart = await Cart.findById(id_carrito).populate('usuario').populate('productos.producto');
      if (!cart) {
        throw new Error('Carrito no encontrado.');
      }
      if (cart.estatus !== 'cerrado') {
        throw new Error('El carrito debe estar cerrado antes de emitir una factura.');
      }
    
      try {
        const user = cart.usuario;
    
        // Formatear los productos para FacturAPI
        const items = cart.productos.map((item) => {
          const priceWithoutTax = item.producto.price / 1.16; // Precio sin IVA
          const iva = priceWithoutTax * 0.16; // IVA del 16%
    
          return {
            quantity: item.cantidad,
            product: {
              description: item.producto.name,
              product_key: '60131324',
              price: priceWithoutTax,
              tax_included: false,
              taxes: [{ rate: 0.16, type: 'IVA' }],
            },
          };
        });
    
        const factura = await facturapi.invoices.create({
          customer: {
            legal_name: user.nombreCompleto,
            email: user.email,
            tax_id: 'XAXX010101000',
            tax_system: '601',
            address: {
              street: user.direccion.calle || '',
              zip: String(user.direccion.zip) || '',
              municipality: user.direccion.municipio || '',
              state: user.direccion.estado || '',
            },
            phone: user.telefono || '',
          },
          items,
          payment_form: '03',
          folio_number: Math.floor(Math.random() * 10000),
          series: 'F',
        });
    
        let draftFactura = factura;
        if (factura.status !== 'draft') {
          draftFactura = await facturapi.invoices.copyToDraft(factura.id);
        }
    
        const facturaTimbrada = await facturapi.invoices.stampDraft(draftFactura.id);
        const pdfStream = await facturapi.invoices.downloadPdf(facturaTimbrada.id);
        const localPath = `./factura-${facturaTimbrada.id}.pdf`;
        const pdfFile = fs.createWriteStream(localPath);
    
        await new Promise((resolve, reject) => {
          pdfStream.pipe(pdfFile);
          pdfFile.on('finish', resolve);
          pdfFile.on('error', reject);
        });
    
        const cloudinaryUrl = await subirArchivoCloudinary(localPath);
        fs.unlinkSync(localPath);
    
        return {
          message: 'Factura generada, timbrada y almacenada exitosamente en Cloudinary.',
          facturaId: facturaTimbrada.id,
          facturaUrl: cloudinaryUrl,
        };
      } catch (error) {
        console.error('Error generando factura:', error);
        throw new Error('No se pudo generar la factura. Intenta nuevamente.');
      }
    },    
  };

  module.exports = cartService;
