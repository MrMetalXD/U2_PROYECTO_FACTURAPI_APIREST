const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Rutas del carrito
router.get('/', cartController.getCarts); // Obtener todos los carritos
router.get('/:id', cartController.getCartById); // Obtener un carrito por ID
router.post('/', cartController.createCart); // Crear un carrito nuevo
router.put('/:id', cartController.updateCart); // Actualizar un carrito existente
router.delete('/:id', cartController.deleteCart); // Eliminar un carrito
router.delete('/:id/productos', cartController.deleteProductFromCart); // Eliminar producto de carrito

router.post('/:id/productos', cartController.addProductToCart);  // Agregar producto al carrito
router.put('/:id/productos', cartController.updateCartProducts);// Ruta para actualizar productos en un carrito específico

router.post('/:id/process-payment', cartController.procesarPagoYCerrarCarrito);
router.post('/:id/issue-invoice', cartController.emitirFactura);// Ruta para emitir factura




module.exports = router;
