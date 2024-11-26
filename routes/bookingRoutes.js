const express = require ( 'express');
const { 
  createBooking, 
  cancelBooking, 
  getUserBookings 
} =  require('../controllers/bookingController.js');
const { 
  authenticate, 
  authorize 
} = require( '../middlewares/authMiddleware.js');

const router = express.Router();

// Create a new booking (for authenticated users)
router.post('/:id', 
//   authenticate, 
//   authorize(['user']), 
  createBooking
);

// Cancel a booking
router.delete('/:bookingId', 
  authenticate, 
  authorize(['user']), 
  cancelBooking
);

// Get user's bookings
router.get('/', 
  authenticate, 
  authorize(['user']), 
  getUserBookings
);

module.exports=  router;