const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productos: [
    {
      producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      cantidad: { type: Number, required: true },
    },
  ],
  subtotal: { type: Number, default: 0 },
  iva: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  estatus: { type: String, enum: ['activo', 'cerrado'], default: 'activo' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  fecha_creacion: { type: Date, default: Date.now },
  fecha_cierre: { type: Date },
});
//cambios
module.exports = mongoose.model('Cart', cartSchema);
