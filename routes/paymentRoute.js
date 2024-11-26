const express = require('express');
const {
    createPaymentIntent,
    confirmPayment,
    refundPayment,
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to create a payment intent
router.post('/create-intent', authenticate, authorize(['user']), createPaymentIntent);

// Route to confirm a payment
router.post('/confirm', authenticate, authorize(['user']), confirmPayment);

// Route to refund a payment
router.post('/refund', authenticate, authorize(['user']), refundPayment);

module.exports = router;
