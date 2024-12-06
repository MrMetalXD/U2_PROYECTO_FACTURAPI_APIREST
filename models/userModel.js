const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombreCompleto: {type : String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    direccion: String,
    telefono: String,
    fechaRegistro: {type: Date, default: Date.now},
    tipoUsuario: { type: String, enum: ['cliente', 'admin'], default: 'cliente' },
    metodoPagoPreferido: [String],
    facturapiid:{type: String}
});
module.exports = mongoose.model('User', userSchema)