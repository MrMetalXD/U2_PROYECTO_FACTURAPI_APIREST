const Facturapi = require('facturapi').default;

const facturapi = new Facturapi("sk_test_2NbGV0oEzXwqaA9Jdv4va2o4qPW148mLD5YenKxP6j");


async function createProduct(product){
    const facturapiProduct = {
        description: product.description,
        product_key: "50202306",
        price: product.price
    };
    return await facturapi.products.create(facturapiProduct);
};

async function createCustomer(user) {
    return await facturapi.customers.create({
      legal_name: user.nombreCompleto,
      email: user.email,
      tax_id: user.rfc || "XAXX010101000", // Usa un RFC de prueba si no se proporciona uno real
      tax_system: "601", // Código del régimen fiscal (modifica según sea necesario)
      address: {
        street: user.direccion || "",
        zip: "12345" // Ajusta el código postal según sea necesario
      },
      phone: user.telefono
    });
  }


  async function updateCustomer(facturapiId, user) {
    return await facturapi.customers.update(facturapiId, {
      legal_name: user.nombreCompleto,
      email: user.email,
      address: {
        street: user.direccion || "",
        zip: "12345"
      },
      phone: user.telefono
    });
  }


  async function deleteCustomer(facturapiId) {
    return await facturapi.customers.del(facturapiId);
  }
  
module.exports = { facturapi, createProduct, createCustomer, updateCustomer, deleteCustomer };