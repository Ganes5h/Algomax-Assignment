const { query, transaction } = require('../config/config');

// Input validation helper
const validateBookingInput = (input) => {
  const errors = [];

  if (!input.event_id) {
    errors.push('Event ID is required');
  }

  if (!input.num_tickets || input.num_tickets <= 0) {
    errors.push('Number of tickets must be a positive integer');
  }

  return errors;
};

exports.createBooking = async (req, res) => {
    try {
        const { event_id, num_tickets, tenant_id } = req.body;

        // Validate input
        const validationErrors = validateBookingInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationErrors,
            });
        }

        // Verify user exists
        const userCheck = await query(
            `SELECT user_id FROM users WHERE user_id = ?`,
            [req.params.id]
        );

        if (!userCheck || userCheck.length === 0) {
            return res.status(404).json({ 
                message: 'User not found', 
                userId: req.params.id 
            });
        }

        // Check event availability directly from events table
        const eventCheck = await query(
            `SELECT event_id, available_tickets, ticket_price as price 
             FROM events 
             WHERE event_id = ? AND tenant_id = ?`,
            [event_id, tenant_id]
        );

        // Ensure eventCheck is not empty
        if (!eventCheck || eventCheck.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const event = eventCheck[0];

        // Check if available_tickets exists and is sufficient
        if (typeof event.available_tickets === 'undefined') {
            return res.status(400).json({ message: 'Tickets information is missing' });
        }

        if (event.available_tickets < num_tickets) {
            return res.status(400).json({
                message: 'Insufficient tickets available',
                availableTickets: event.available_tickets,
            });
        }

        // Calculate total price
        const totalPrice = event.price * num_tickets;

        // Prepare booking and event update queries
        const bookingQueries = [
            // Insert booking
            {
                sql: `
                    INSERT INTO ticket_bookings 
                    (event_id, user_id, num_tickets, total_price,
                    booking_status, payment_status, booking_timestamp, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                `,
                params: [
                    event_id,
                    req.params.id,  
                    num_tickets,
                    totalPrice,
                    'pending', // Default booking status
                    'pending'  // Default payment status
                ]
            },
            // Update event available tickets
            {
                sql: `
                    UPDATE events 
                    SET available_tickets = available_tickets - ?,
                        updated_at = NOW()
                    WHERE event_id = ?
                `,
                params: [num_tickets, event_id]
            }
        ];

        // Execute transaction
        const [bookingResult] = await transaction(bookingQueries);

        res.status(201).json({
            message: 'Booking created successfully',
            bookingId: bookingResult.insertId,
            eventId: event_id,
            numTickets: num_tickets,
            totalPrice: totalPrice,
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        
        // More detailed error handling
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                message: 'Invalid user or event. Ensure the user and event exist.',
                errorDetails: error.sqlMessage
            });
        }

        res.status(500).json({
            message: 'Booking failed',
            error: error.message,
        });
    }
};
  
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    // Retrieve booking details
    const [bookings] = await query(
      `SELECT 
        b.id, b.event_id, b.num_tickets, 
        b.booking_status, b.total_price,
        e.start_datetime
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.id = ? AND b.user_id = ?`,
      [bookingId, req.user.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    // Check cancellation eligibility
    const eventStartDate = new Date(booking.start_datetime);
    const now = new Date();

    if (eventStartDate <= now) {
      return res.status(400).json({ 
        message: 'Cannot cancel booking for past or ongoing events' 
      });
    }

    // Check if booking can be cancelled
    if (booking.booking_status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Prepare cancellation queries
    const cancelQueries = [
      // Update booking status
      {
        sql: `
          UPDATE bookings 
          SET booking_status = 'cancelled', 
              payment_status = 'refunded',
              updated_at = NOW() 
          WHERE id = ?`,
        params: [bookingId]
      },
      // Restore ticket availability
      {
        sql: `
          UPDATE tickets 
          SET quantity = quantity + ?, 
              updated_at = NOW() 
          WHERE event_id = ?`,
        params: [booking.num_tickets, booking.event_id]
      },
      // Restore event available tickets
      {
        sql: `
          UPDATE events 
          SET available_tickets = available_tickets + ?, 
              updated_at = NOW() 
          WHERE id = ?`,
        params: [booking.num_tickets, booking.event_id]
      }
    ];

    // Execute transaction
    await transaction(cancelQueries);

    res.status(200).json({ 
      message: 'Booking cancelled successfully',
      refundAmount: booking.total_price
    });
  } catch (error) {
    console.error('Booking cancellation error:', error);
    res.status(500).json({ 
      message: 'Booking cancellation failed', 
      error: error.message 
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { 
      tenant_id,
      status, 
      event_id, 
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT 
        b.id as booking_id, 
        b.booking_status, 
        b.booking_timestamp,
        b.num_tickets,
        b.total_price,
        e.name as event_name, 
        e.start_datetime,
        t.ticket_type,
        t.price as ticket_price,
        u.username,  -- Fetch user information
        u.email
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      JOIN tickets t ON e.id = t.event_id
      JOIN users u ON b.user_id = u.id  -- Join with users table to fetch user data
      WHERE b.user_id = ? AND e.tenant_id = ?`;

    const queryParams = [req.user.id, tenant_id];

    // Add optional filters
    if (status) {
      baseQuery += ' AND b.booking_status = ?';
      queryParams.push(status);
    }
    if (event_id) {
      baseQuery += ' AND b.event_id = ?';
      queryParams.push(event_id);
    }

    // Add pagination
    baseQuery += ' ORDER BY b.booking_timestamp DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [bookings] = await query(baseQuery, queryParams);

    // Get total count for pagination
    const [countResult] = await query(
      `SELECT COUNT(*) as total 
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       JOIN users u ON b.user_id = u.id
       WHERE b.user_id = ? AND e.tenant_id = ? 
       ${status ? 'AND b.booking_status = ?' : ''}
       ${event_id ? 'AND b.event_id = ?' : ''}`,
      queryParams.slice(0, -2)
    );

    res.status(200).json({
      bookings,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to retrieve bookings', 
      error: error.message 
    });
  }
};
