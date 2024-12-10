const mongoose = require('mongoose');
const Product = require('../models/productModel');
const { facturapi } = require('../apis/facturapi');

const productService = {
  getProducts: async () => await Product.find(),
  createProduct: async (args) => {
    const product = new Product(args);
    const facturapiproduct = await facturapi.products.create({
      description: args.description,
      product_key: "50202306",
      price: args.price
    });
    product.facturapiid = facturapiproduct.id;
    return await product.save();
  },
  updateProduct: async ({ _id, ...rest }) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new Error('El ID proporcionado no es válido');
    }
//cambios
    const productId = new mongoose.Types.ObjectId(_id);
    const productToUpdate = await Product.findById(productId);
    if (!productToUpdate) throw new Error('Producto no encontrado');

    // Actualiza el producto en Facturapi usando el método `update`
    await facturapi.products.update(productToUpdate.facturapiid, {
      description: rest.description || productToUpdate.description,
      product_key: "50202306",
      price: rest.price || productToUpdate.price,
    });

    // Actualiza el producto en MongoDB
    Object.assign(productToUpdate, rest);
    return await productToUpdate.save();
  },
  deleteProduct: async (_id) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new Error('El ID proporcionado no es válido');
    }

    const productId = new mongoose.Types.ObjectId(_id);
    const productToDelete = await Product.findById(productId);
    if (!productToDelete) throw new Error('Producto no encontrado');

    await facturapi.products.del(productToDelete.facturapiid);

    return await Product.findByIdAndDelete(productId);
  }
};

module.exports = productService;
