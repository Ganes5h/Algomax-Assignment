const express = require("express");
const router = express.Router();
const {
  createBooking,
  confirmBookingPayment,
  cancelBooking,
  getUserBookings,
  getBooking,
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

module.exports = router;
