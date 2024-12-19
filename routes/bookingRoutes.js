const express = require("express");
const router = express.Router();
const {
  createBooking,
  createPaymentIntent,
  confirmBookingPayment,
  cancelBooking,
  getUserBookings,
  getBooking,
  BookingController,
} = require("../controllers/bookingController");
// const { protect } = require("../middleware/auth"); // Assuming you have an auth middleware for user authentication

// Create a new booking
router.post("/", createBooking);

// Confirm booking payment
router.post("/:id/confirm", confirmBookingPayment);

// Cancel booking
router.put("/:id/cancel", cancelBooking);

// Get all user's bookings
router.get("/", getUserBookings);

// Get a single booking by ID
router.get("/:id", getBooking);

router.post("/create-payment-intent", createPaymentIntent);

router.post("/bookings", BookingController.createBooking);
router.post("/bookings/verify-payment", BookingController.verifyPayment);
router.post("/bookings/verify-qr", BookingController.verifyQRCode);

module.exports = router;
