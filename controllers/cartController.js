const cartService = require('../services/cartService');
const calcularSubtotal = (productos) => {
  return productos.reduce((total, producto) => {
    if (typeof producto.precio !== 'number' || typeof producto.cantidad !== 'number') {
      throw new Error('Precio o cantidad no válido');
    }
    return total + producto.precio * producto.cantidad;
  }, 0);
} 
const cartController = {
  getCarts: async (req, res) => {
    try {
      const carts = await cartService.getCarts(); // Llama al servicio para obtener todos los carritos
      res.status(200).json(carts); // Devuelve la respuesta con los carritos
    } catch (error) {
      res.status(500).json({ error: error.message }); // En caso de error, devuelve un error 500
    }
  },

  getCartById: async (req, res) => {
    try {
      const cart = await cartService.getCartById(req.params.id);
      if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

createCart: async (req, res) => {
  try {
    const { usuario } = req.body;
    if (!usuario) {
      return res.status(400).json({ error: 'El campo "usuario" es obligatorio.' });
    }
    const newCart = await cartService.CrearCarrito(usuario);
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},

// Controlador
addProductToCart: async (req, res) => {
  try {
    const { id } = req.params;
    const { productoId, cantidad } = req.body;

    if (!productoId || typeof cantidad !== 'number' || cantidad <= 0) {
      return res.status(400).json({ error: 'Datos de producto o cantidad inválidos.' });
    }

    const updatedCart = await cartService.addProductToCart(id, productoId, cantidad);
    res.status(200).json({ mensaje: 'Producto agregado al carrito', carrito: updatedCart });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: error.message });
  }
},

updateCartProducts: async (req, res) => {
  try {
    const { id } = req.params; // ID del carrito
    const { productos } = req.body; // Productos enviados en el cuerpo de la solicitud

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: 'Debes enviar al menos un producto.' });
    }

    // Usar cartService para actualizar los productos en el carrito
    const updatedCart = await cartService.updateCartProducts(id, productos);
    res.status(200).json(updatedCart); // Respuesta con el carrito actualizado
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},


updateCart: async (req, res) => {
  try {
    const { productos } = req.body;

    // Encuentra el carrito
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    // Actualiza los productos
    cart.productos = productos;

    // Recalcula el subtotal
    cart.subtotal = productos.reduce((total, item) => {
      if (!item.cantidad || !item.producto.precio) {
        throw new Error('Producto o cantidad inválida');
      }
      return total + item.cantidad * item.producto.precio;
    }, 0);

    // Calcula IVA y total
    cart.iva = cart.subtotal * 0.16; // Ejemplo: 16% de IVA
    cart.total = cart.subtotal + cart.iva;

    // Guarda el carrito actualizado
    const updatedCart = await cart.save();
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},


deleteCart: async (req, res) => {
  try {
    const response = await cartService.deleteCart(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},


  deleteProductFromCart: async (req, res) => {
    try {
      const { productoId } = req.body;
      const updatedCart = await cartService.deleteProductFromCart(req.params.id, productoId);
      res.status(200).json(updatedCart);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  procesarPagoYCerrarCarrito: async (req, res) => {
    try {
      const { id } = req.params; // id del carrito
      const { paymentMethodId } = req.body; // id del método de pago

      // Llamar al servicio
      const result = await cartService.ProcesarPagoYCerrarCarrito(id, paymentMethodId);

      // Enviar respuesta con el resultado
      res.status(200).json(result);
    } catch (error) {
      console.error('Error en el controlador:', error);
      // Responder con error si algo falla
      res.status(500).json({ error: error.message });
    }
  },


  // Emitir la factura
  emitirFactura: async (req, res) => {
    try {
      const { id } = req.params; // id del carrito
      const result = await cartService.EmitirFactura(id);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

};

module.exports = cartController;
