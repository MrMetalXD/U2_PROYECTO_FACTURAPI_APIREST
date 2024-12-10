const express = require('express');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes'); 
const connectMongo = require('./mongoConfig');

const app = express();
connectMongo();

// Middleware para parsear JSON (usando Express integrado)
app.use(express.json());

// Rutas
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/carts', cartRoutes); // Nuevo endpoint para el carrito

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
