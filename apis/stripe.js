const Stripe = require('stripe');

// Clave secreta de Stripe (de prueba)

const stripe = new Stripe("sk_test_51QPYshLNtnST9ZJPkc5QIkV3pYfc9byv7rFU146TxzjNZySitxB6PgvzfljS14OfmHYSlPgLz7NR0Y2dOkyCo7qR00ArJiPQIW");

module.exports = stripe;