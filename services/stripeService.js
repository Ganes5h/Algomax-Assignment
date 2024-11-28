const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (amount) => {
  return stripe.paymentIntents.create({
    amount: amount * 100, // Stripe expects amount in cents
    currency: "usd",
  });
};
