const express = require('express');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const connectMongo = require('./mongoConfig');

const app = express();
connectMongo();

app.use(bodyParser.json());
app.use('/products', productRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;