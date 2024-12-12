    const productService = require('../services/productService');

    const productsController = {
        getProducts : async (req, res) => {
            try {
                const products = await productService.getProducts();
                res.status(200).json(products);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
        //cambios
        createProduct : async (req, res) => {
            try {
                const args = req.body; // Datos del producto desde el cuerpo de la solicitud
                const product = await productService.createProduct(args);
                res.status(201).json(product);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
        
        updateProduct : async (req, res) => {
            try {
                const {id} = req.params;
                const updated = req.body; // Datos actualizados del producto desde el cuerpo de la solicitud
                const updateProduct = await productService.updateProduct({ _id: id, ...updated });
                res.status(200).json(updateProduct);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },

        deleteProduct : async (req, res) => {
            try {
                const {id} = req.params;
                const deleted = await productService.deleteProduct(id);
                res.status(200).json(deleted);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
    };

    module.exports = productsController;
