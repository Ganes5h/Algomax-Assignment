// const { redisClient } = require("../config/redis");
// const db = require("../config/config");
// // const { validateEvent } = require("../validators/eventValidator");

// const listEvents = async (req, res, next) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       category,
//       startDate,
//       endDate,
//       location,
//       status = "published",
//     } = req.query;

//     const offset = (page - 1) * limit;

//     let query = `
//       SELECT e.*, ec.name as category_name, 
//              u.first_name, u.last_name,
//              COUNT(b.id) as total_bookings
//       FROM events e
//       LEFT JOIN event_categories ec ON e.category_id = ec.id
//       LEFT JOIN users u ON e.organizer_id = u.id
//       LEFT JOIN bookings b ON e.id = b.event_id
//       WHERE e.tenant_id = ? AND e.status = ?
//     `;

//     const params = [req.user.tenant_id, status];

//     if (category) {
//       query += " AND e.category_id = ?";
//       params.push(category);
//     }

//     if (startDate) {
//       query += " AND e.start_date >= ?";
//       params.push(startDate);
//     }

//     if (endDate) {
//       query += " AND e.end_date <= ?";
//       params.push(endDate);
//     }

//     if (location) {
//       query += " AND e.location LIKE ?";
//       params.push(`%${location}%`);
//     }

//     query += " GROUP BY e.id LIMIT ? OFFSET ?";
//     params.push(parseInt(limit), offset);

//     const [events] = await db.query(query, params);

//     const [totalCount] = await db.query(
//       "SELECT COUNT(*) as count FROM events WHERE tenant_id = ? AND status = ?",
//       [req.user.tenant_id, status]
//     );

//     res.json({
//       data: events,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: totalCount[0].count,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getEvent = async (req, res, next) => {
//   try {
//     const [event] = await db.query(
//       `SELECT e.*, ec.name as category_name,
//               u.first_name, u.last_name,
//               COUNT(DISTINCT b.id) as total_bookings,
//               COUNT(DISTINCT w.id) as total_wishlists
//        FROM events e
//        LEFT JOIN event_categories ec ON e.category_id = ec.id
//        LEFT JOIN users u ON e.organizer_id = u.id
//        LEFT JOIN bookings b ON e.id = b.event_id
//        LEFT JOIN wishlists w ON e.id = w.event_id
//        WHERE e.id = ? AND e.tenant_id = ?
//        GROUP BY e.id`,
//       [req.params.id, req.user.tenant_id]
//     );

//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     res.json(event);
//   } catch (error) {
//     next(error);
//   }
// };

// const createEvent = async (req, res, next) => {
//   try {
//     // const { error } = validateEvent(req.body);
//     // if (error) {
//     //   return res.status(400).json({ message: error.details[0].message });
//     // }

//     const {
//       category_id,
//       title,
//       description,
//       location,
//       venue_address,
//       start_date,
//       end_date,
//       timezone,
//       total_tickets,
//       ticket_price,
//       ticket_types,
//     } = req.body;

//     const connection = await db.getConnection();
//     await connection.beginTransaction();

//     try {
//       const [result] = await connection.query(
//         `INSERT INTO events (
//           tenant_id, organizer_id, category_id, title, description,
//           location, venue_address, start_date, end_date, timezone,
//           total_tickets, available_tickets, ticket_price, status
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           req.user.tenant_id,
//           req.user.id,
//           category_id,
//           title,
//           description,
//           location,
//           venue_address,
//           start_date,
//           end_date,
//           timezone,
//           total_tickets,
//           total_tickets, // Initially available tickets equals total tickets
//           ticket_price,
//           "draft",
//         ]
//       );

//       const eventId = result.insertId;

//       // Insert ticket types if provided
//       if (ticket_types && ticket_types.length > 0) {
//         const ticketTypeValues = ticket_types.map((type) => [
//           eventId,
//           type.name,
//           type.description,
//           type.price,
//           type.quantity,
//           type.quantity, // Initially available quantity equals total quantity
//         ]);

//         await connection.query(
//           `INSERT INTO ticket_types (
//             event_id, name, description, price, quantity, available_quantity
//           ) VALUES ?`,
//           [ticketTypeValues]
//         );
//       }

//       // Create initial analytics record
//       await connection.query(
//         "INSERT INTO event_analytics (event_id) VALUES (?)",
//         [eventId]
//       );

//       await connection.commit();

//       const [event] = await db.query("SELECT * FROM events WHERE id = ?", [
//         eventId,
//       ]);

//       res.status(201).json(event);
//     } catch (error) {
//       await connection.rollback();
//       throw error;
//     } finally {
//       connection.release();
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// const updateEvent = async (req, res, next) => {
//   try {
//     // const { error } = validateEvent(req.body);
//     // if (error) {
//     //   return res.status(400).json({ message: error.details[0].message });
//     // }

//     const [event] = await db.query(
//       "SELECT * FROM events WHERE id = ? AND tenant_id = ?",
//       [req.params.id, req.user.tenant_id]
//     );

//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     if (event.organizer_id !== req.user.id && req.user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to update this event" });
//     }

//     const {
//       category_id,
//       title,
//       description,
//       location,
//       venue_address,
//       start_date,
//       end_date,
//       timezone,
//       total_tickets,
//       ticket_price,
//       status,
//     } = req.body;

//     await db.query(
//       `UPDATE events SET
//         category_id = ?,
//         title = ?,
//         description = ?,
//         location = ?,
//         venue_address = ?,
//         start_date = ?,
//         end_date = ?,
//         timezone = ?,
//         total_tickets = ?,
//         ticket_price = ?,
//         status = ?,
//         updated_at = CURRENT_TIMESTAMP
//        WHERE id = ?`,
//       [
//         category_id,
//         title,
//         description,
//         location,
//         venue_address,
//         start_date,
//         end_date,
//         timezone,
//         total_tickets,
//         ticket_price,
//         status,
//         req.params.id,
//       ]
//     );

//     const [updatedEvent] = await db.query("SELECT * FROM events WHERE id = ?", [
//       req.params.id,
//     ]);

//     res.json(updatedEvent);
//   } catch (error) {
//     next(error);
//   }
// };

// const deleteEvent = async (req, res, next) => {
//   try {
//     const [event] = await db.query(
//       "SELECT * FROM events WHERE id = ? AND tenant_id = ?",
//       [req.params.id, req.user.tenant_id]
//     );

//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     if (event.organizer_id !== req.user.id && req.user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to delete this event" });
//     }

//     const connection = await db.getConnection();
//     await connection.beginTransaction();

//     try {
//       // Delete related records
//       await connection.query("DELETE FROM event_analytics WHERE event_id = ?", [
//         req.params.id,
//       ]);
//       await connection.query("DELETE FROM wishlists WHERE event_id = ?", [
//         req.params.id,
//       ]);
//       await connection.query("DELETE FROM notifications WHERE event_id = ?", [
//         req.params.id,
//       ]);
//       await connection.query("DELETE FROM ticket_types WHERE event_id = ?", [
//         req.params.id,
//       ]);

//       // Check for bookings
//       const [bookings] = await connection.query(
//         'SELECT id FROM bookings WHERE event_id = ? AND status IN ("confirmed", "pending")',
//         [req.params.id]
//       );

//       if (bookings.length > 0) {
//         // If there are active bookings, mark the event as cancelled instead of deleting
//         await connection.query(
//           'UPDATE events SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
//           [req.params.id]
//         );
//       } else {
//         // If no active bookings, delete the event
//         await connection.query("DELETE FROM events WHERE id = ?", [
//           req.params.id,
//         ]);
//       }

//       await connection.commit();
//       res.status(204).end();
//     } catch (error) {
//       await connection.rollback();
//       throw error;
//     } finally {
//       connection.release();
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// const getEventAnalytics = async (req, res, next) => {
//   try {
//     const [event] = await db.query(
//       "SELECT * FROM events WHERE id = ? AND tenant_id = ?",
//       [req.params.id, req.user.tenant_id]
//     );

//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     const [analytics] = await db.query(
//       "SELECT * FROM event_analytics WHERE event_id = ?",
//       [req.params.id]
//     );

//     res.json(analytics);
//   } catch (error) {
//     next(error);
//   }
// };

// // Export functions
// module.exports = {
//   listEvents,
//   getEvent,
//   createEvent,
//   updateEvent,
//   deleteEvent,
//   getEventAnalytics,
// };

const { query, transaction } = require('../config/config');


// Input validation helper
const validateEventInput = (input) => {
  const errors = [];
  const now = new Date();

  if (!input.title || input.title.trim() === '') {
    errors.push('Event title is required');
  }

  if (!input.start_datetime) {
    errors.push('Start datetime is required');
  } else {
    const startDate = new Date(input.start_datetime);
    if (startDate < now) {
      errors.push('Event start date cannot be in the past');
    }
  }

  if (!input.end_datetime) {
    errors.push('End datetime is required');
  } else {
    const startDate = new Date(input.start_datetime);
    const endDate = new Date(input.end_datetime);
    if (endDate <= startDate) {
      errors.push('End datetime must be after start datetime');
    }
  }

  if (!input.total_tickets || input.total_tickets <= 0) {
    errors.push('Total tickets must be greater than 0');
  }

  return errors;
};

exports.createEvent = async (req, res) => {
  try {
    const { 
      title,
      description,
      location,
      start_datetime,
      end_datetime,
      category,
      ticket_price,
      total_tickets,
      ticket_type = 'standard',
      age_restriction,
      online_event,
      event_link
    } = req.body;

    // Fetch tenant_id from URL params
    const tenant_id = req.params.id;

    // Validate input
    const validationErrors = validateEventInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Prepare event creation query
    const eventQuery = {
      sql: `
        INSERT INTO events 
        (tenant_id, organizer_id, title, description, location, 
        start_datetime, end_datetime, category, ticket_price, 
        total_tickets, available_tickets, status, age_restriction, 
        online_event, event_link, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      params: [
        tenant_id,
        req.user?.id || null,  // Use null if req.user?.id is undefined
        title,
        description,
        location,
        start_datetime,
        end_datetime,
        category,
        ticket_price,
        total_tickets,
        total_tickets,  // Initially all tickets are available
        'draft',  // Default status
        age_restriction || null,  // If age_restriction is undefined, pass null
        online_event !== undefined ? online_event : false,  // Ensure online_event is not undefined
        event_link || null  // If event_link is undefined, pass null
      ]
    };

    // Prepare ticket query
    const ticketQuery = {
      sql: `
        INSERT INTO tickets 
        (event_id, ticket_type, quantity, price) 
        VALUES (?, ?, ?, ?)
      `,
      params: null  // Will be populated after event creation
    };

    // Execute transaction
    const [eventResult] = await transaction([eventQuery]);
    const eventId = eventResult.insertId;

    // Create ticket
    ticketQuery.params = [
      eventId, 
      ticket_type, 
      total_tickets, 
      ticket_price
    ];
    const [ticketResult] = await transaction([ticketQuery]);

    res.status(201).json({
      message: 'Event created successfully',
      eventId: eventId,
      ticketId: ticketResult.insertId
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ 
      message: 'Event creation failed', 
      error: error.message 
    });
  }
};


exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { 
      title,
      description,
      location,
      start_datetime,
      end_datetime,
      category,
      ticket_price,
      total_tickets,
      ticket_type,
      status,
      age_restriction,
      online_event,
      event_link
    } = req.body;

    // Validate input
    const validationErrors = validateEventInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Check event existence
    const [existingEvents] = await query(
      'SELECT id FROM events WHERE id = ? AND tenant_id = ?', 
      [eventId, req.body.tenant_id]
    );

    if (existingEvents.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Prepare event update query
    const updateQuery = {
      sql: `
        UPDATE events 
        SET title = ?, description = ?, location = ?, 
            start_datetime = ?, end_datetime = ?, category = ?, 
            ticket_price = ?, total_tickets = ?, available_tickets = ?, 
            status = ?, age_restriction = ?, online_event = ?, 
            event_link = ?, updated_at = NOW()
        WHERE id = ?
      `,
      params: [
        title,
        description,
        location,
        start_datetime,
        end_datetime,
        category,
        ticket_price,
        total_tickets,
        total_tickets, // Reset available tickets
        status || 'draft',
        age_restriction,
        online_event || false,
        event_link || null,
        eventId
      ]
    };

    // Prepare ticket update query
    const ticketUpdateQuery = {
      sql: `
        UPDATE tickets 
        SET ticket_type = ?, quantity = ?, price = ?
        WHERE event_id = ?
      `,
      params: [
        ticket_type || 'standard', 
        total_tickets, 
        ticket_price,
        eventId
      ]
    };

    // Execute transactions
    await transaction([updateQuery]);
    await transaction([ticketUpdateQuery]);

    res.status(200).json({ 
      message: 'Event updated successfully',
      eventId: eventId
    });
  } catch (error) {
    console.error('Event update error:', error);
    res.status(500).json({ 
      message: 'Event update failed', 
      error: error.message 
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { 
      tenant_id,
      category, 
      start_datetime, 
      end_datetime, 
      status,
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT e.*, t.ticket_type, t.quantity as ticket_quantity, t.price as ticket_price
      FROM events e
      LEFT JOIN tickets t ON e.id = t.event_id
      WHERE e.tenant_id = ?
    `;

    const queryParams = [tenant_id];

    // Add optional filters
    if (category) {
      baseQuery += ' AND e.category = ?';
      queryParams.push(category);
    }
    if (start_datetime) {
      baseQuery += ' AND e.start_datetime >= ?';
      queryParams.push(start_datetime);
    }
    if (end_datetime) {
      baseQuery += ' AND e.end_datetime <= ?';
      queryParams.push(end_datetime);
    }
    if (status) {
      baseQuery += ' AND e.status = ?';
      queryParams.push(status);
    }

    // Add pagination
    baseQuery += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    const [events] = await query(baseQuery, queryParams);

    // Get total count for pagination
    const [countResult] = await query(
      `SELECT COUNT(*) as total 
       FROM events 
       WHERE tenant_id = ?
       ${category ? 'AND category = ?' : ''}
       ${start_datetime ? 'AND start_datetime >= ?' : ''}
       ${end_datetime ? 'AND end_datetime <= ?' : ''}
       ${status ? 'AND status = ?' : ''}`,
      queryParams.slice(0, -2)
    );

    res.status(200).json({
      events,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to retrieve events', 
      error: error.message 
    });
  }
};

exports.getEventDetails = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const [events] = await query(
      `SELECT e.*, t.ticket_type, t.quantity as ticket_quantity, t.price as ticket_price
       FROM events e
       LEFT JOIN tickets t ON e.id = t.event_id
       WHERE e.id = ?`,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(events[0]);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to retrieve event details', 
      error: error.message 
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { tenant_id } = req.body;

    // Check event existence and tenant ownership
    const [existingEvents] = await query(
      'SELECT id FROM events WHERE id = ? AND tenant_id = ?', 
      [eventId, tenant_id]
    );

    if (existingEvents.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete event and associated ticket
    const deleteQueries = [
      {
        sql: 'DELETE FROM tickets WHERE event_id = ?',
        params: [eventId]
      },
      {
        sql: 'DELETE FROM events WHERE id = ?',
        params: [eventId]
      }
    ];

    await transaction(deleteQueries);

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Event deletion failed', 
      error: error.message 
    });
  }
};