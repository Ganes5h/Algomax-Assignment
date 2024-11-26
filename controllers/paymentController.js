const stripe = require('../config/stripeConfig');
const { query, transaction } = require('../config/config');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { 
            booking_id, 
            amount,  // in dollars
            currency = 'usd' 
        } = req.body;

        // Verify booking exists and belongs to user
        const [bookingCheck] = await query(
            `SELECT id, booking_status 
             FROM ticket_bookings 
             WHERE id = ? AND user_id = ?`,
            [booking_id, req.params.id]
        );

        if (bookingCheck.length === 0) {
            return res.status(404).json({ 
                message: 'Booking not found or unauthorized' 
            });
        }

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                booking_id: booking_id,
                user_id: req.params.id
            }
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Payment Intent Creation Error:', error);
        res.status(500).json({ 
            message: 'Failed to create payment intent', 
            error: error.message 
        });
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const { 
            payment_intent_id, 
            booking_id 
        } = req.body;

        // Retrieve the payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        // Validate payment status
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ 
                message: 'Payment not completed',
                status: paymentIntent.status
            });
        }

        // Prepare payment and booking update queries
        const paymentQueries = [
            // Insert payment record
            {
                sql: `
                    INSERT INTO payments (
                        booking_id, 
                        payment_amount, 
                        payment_status, 
                        payment_method, 
                        payment_date,
                        payment_intent_id
                    ) VALUES (?, ?, ?, ?, NOW(), ?)
                `,
                params: [
                    booking_id, 
                    paymentIntent.amount / 100, // Convert back to dollars
                    'completed', 
                    'stripe',
                    payment_intent_id
                ]
            },
            // Update booking status
            {
                sql: `
                    UPDATE ticket_bookings 
                    SET booking_status = 'confirmed',
                        payment_status = 'completed',
                        updated_at = NOW()
                    WHERE id = ?
                `,
                params: [booking_id]
            }
        ];

        // Execute transaction
        await transaction(paymentQueries);

        res.status(200).json({ 
            message: 'Payment confirmed successfully',
            bookingId: booking_id,
            paymentIntentId: payment_intent_id
        });
    } catch (error) {
        console.error('Payment Confirmation Error:', error);
        res.status(500).json({ 
            message: 'Payment confirmation failed', 
            error: error.message 
        });
    }
};

exports.refundPayment = async (req, res) => {
    try {
        const { booking_id } = req.body;

        // Retrieve payment details
        const [paymentDetails] = await query(
            `SELECT 
                payment_intent_id, 
                payment_amount 
             FROM payments 
             WHERE booking_id = ? AND payment_status = 'completed'`,
            [booking_id]
        );

        if (paymentDetails.length === 0) {
            return res.status(404).json({ 
                message: 'No completed payment found for this booking' 
            });
        }

        const payment = paymentDetails[0];

        // Create refund
        const refund = await stripe.refunds.create({
            payment_intent: payment.payment_intent_id,
            amount: Math.round(payment.payment_amount * 100) // Convert to cents
        });

        // Prepare refund queries
        const refundQueries = [
            // Update payment status
            {
                sql: `
                    UPDATE payments 
                    SET 
                        payment_status = 'refunded', 
                        refund_amount = ?,
                        refund_date = NOW()
                    WHERE payment_intent_id = ?
                `,
                params: [payment.payment_amount, payment.payment_intent_id]
            },
            // Update booking status
            {
                sql: `
                    UPDATE ticket_bookings 
                    SET 
                        booking_status = 'cancelled', 
                        updated_at = NOW()
                    WHERE id = ?
                `,
                params: [booking_id]
            }
        ];

        // Execute transaction
        await transaction(refundQueries);

        res.status(200).json({ 
            message: 'Refund processed successfully',
            refundId: refund.id,
            refundAmount: payment.payment_amount
        });
    } catch (error) {
        console.error('Refund Processing Error:', error);
        res.status(500).json({ 
            message: 'Refund processing failed', 
            error: error.message 
        });
    }
};

// Webhook handler for Stripe events
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.rawBody, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                // Handle successful payment
                await handleSuccessfulPayment(paymentIntent);
                break;
            
            case 'payment_intent.payment_failed':
                const failedPaymentIntent = event.data.object;
                // Handle failed payment
                await handleFailedPayment(failedPaymentIntent);
                break;
            
            // Add more event handlers as needed
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).send();
    } catch (err) {
        console.error(err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};

// Helper functions for webhook events
async function handleSuccessfulPayment(paymentIntent) {
    const { booking_id } = paymentIntent.metadata;
    // Implement logic for successful payment
    await query(
        `UPDATE ticket_bookings 
         SET booking_status = 'confirmed', 
             payment_status = 'completed' 
         WHERE id = ?`,
        [booking_id]
    );
}

async function handleFailedPayment(paymentIntent) {
    const { booking_id } = paymentIntent.metadata;
    // Implement logic for failed payment
    await query(
        `UPDATE ticket_bookings 
         SET booking_status = 'payment_failed' 
         WHERE id = ?`,
        [booking_id]
    );
}