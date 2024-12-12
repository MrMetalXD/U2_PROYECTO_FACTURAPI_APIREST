const cartService = require('../services/cartService');

// Calcular el subtotal del carrito
const calcularSubtotal = (productos) => {
  return productos.reduce((total, item) => {
    if (!item.producto || typeof item.producto.price !== 'number' || typeof item.cantidad !== 'number') {
      console.log(`Error with product: ${JSON.stringify(item)}`);
      throw new Error('Precio o cantidad no válido');
    }
    return total + item.producto.price * item.cantidad;
  }, 0);
};



const cartController = {
  // Obtener todos los carritos
  getCarts: async (req, res) => {
    try {
      const carts = await cartService.getCarts();
      res.status(200).json(carts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un carrito por su ID
  getCartById: async (req, res) => {
    try {
      const cart = await cartService.getCartById(req.params.id);
      if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Crear un carrito
  createCart: async (req, res) => {
    try {
      const { usuario } = req.body;
      const newCart = await cartService.CrearCarrito(usuario);
      res.status(201).json(newCart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Agregar producto al carrito
  addProductToCart: async (req, res) => {
    try {
      const { id } = req.params;  // Obtener el ID del carrito
      const { productoId, cantidad } = req.body;  // Obtener el ID del producto y la cantidad

      // Verificar que el productoId y la cantidad sean válidos
      if (!productoId || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'El productoId y la cantidad son requeridos y la cantidad debe ser mayor a cero.' });
      }

      // Verificar que el carrito exista
      const cart = await cartService.getCartById(id);
      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado.' });
      }
      const updatedCart = await cartService.agregarProductoAlCarrito(id, productoId, cantidad);
      await updatedCart.populate('productos.producto'); // Poblar los productos para acceder a sus datos
      updatedCart.subtotal = calcularSubtotal(updatedCart.productos);
      updatedCart.iva = updatedCart.subtotal * 0.16;
      updatedCart.total = updatedCart.subtotal + updatedCart.iva;
      await updatedCart.save();      
      // Responder con el carrito actualizado
      res.status(200).json({ mensaje: 'Producto agregado al carrito', carrito: updatedCart });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar productos en el carrito
  updateCartProducts: async (req, res) => {
    try {
      const { id } = req.params; // ID del carrito
      const { productos } = req.body; // Productos enviados en el cuerpo de la solicitud

      if (!productos || productos.length === 0) {
        return res.status(400).json({ error: 'Debes enviar al menos un producto.' });
      }

      // Usar cartService para actualizar los productos en el carrito
      const updatedCart = await cartService.updateCartProducts(id, productos);

      // Recalcular el subtotal, IVA y total
      updatedCart.subtotal = calcularSubtotal(updatedCart.productos);
      updatedCart.iva = updatedCart.subtotal * 0.16;  // 16% de IVA
      updatedCart.total = updatedCart.subtotal + updatedCart.iva;

      // Guardar el carrito actualizado
      await updatedCart.save();

      res.status(200).json(updatedCart); // Respuesta con el carrito actualizado
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar carrito
  deleteCart: async (req, res) => {
    try {
      const response = await cartService.deleteCart(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar producto del carrito
  deleteProductFromCart: async (req, res) => {
    try {
      const { productoId } = req.body;
      const updatedCart = await cartService.deleteProductFromCart(req.params.id, productoId);
      res.status(200).json(updatedCart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Procesar pago y cerrar carrito
  procesarPagoYCerrarCarrito: async (req, res) => {
    try {
      const { id } = req.params; // Asegúrate de que esto capture el ID de la URL
      const { paymentMethodId } = req.body;
      console.log('ID del carrito desde req.params:', req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'Falta el ID del carrito.' });
      }
  
      const result = await cartService.ProcesarPagoYCerrarCarrito(id, paymentMethodId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  

  // Emitir factura
  emitirFactura: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await cartService.EmitirFactura(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = cartController;
