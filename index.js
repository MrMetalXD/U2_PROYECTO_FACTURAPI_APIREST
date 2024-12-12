const app = require('./app');
const PORT = process.env.PORT || 8000;
//cambios
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
