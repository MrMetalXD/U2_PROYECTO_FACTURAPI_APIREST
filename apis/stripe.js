const Stripe = require('stripe');

// Clave secreta de Stripe (de prueba)

const stripe = new Stripe("sk_test_51QVIIZBhCQyshavglnQJs32anHfiWSYFJVeXoQvISG1GoBEyn81fHYXNtBMEG7jbqacJfSnpEtxL3GhfUUPQDwem003zYAMc0L");

module.exports = stripe;