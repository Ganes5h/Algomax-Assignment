const Stripe = require('stripe');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Use the latest API version
    maxNetworkRetries: 3 // Optional: configure retries
});

module.exports = stripe;