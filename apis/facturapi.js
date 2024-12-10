const Facturapi = require('facturapi').default;

const facturapi = new Facturapi("sk_test_7wqPxEe9nl6mdoz0Kjawb9PbPEWZbYOGLp3k5a1M28");


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
    tax_id: user.rfc || 'XAXX010101000', 
    tax_system: '601', 
    address: {
      street: user.direccion.calle || '',
      zip: user.direccion.zip || '', 
      municipality: user.direccion.municipio || '',
      state: user.direccion.estado || '',
    },
    phone: user.telefono || '',
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