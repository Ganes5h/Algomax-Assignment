const { redisClient } = require("../config/redis");
const db = require("../config/config");
// const { validateEvent } = require("../validators/eventValidator");

const listEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      startDate,
      endDate,
      location,
      status = "published",
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, ec.name as category_name, 
             u.first_name, u.last_name,
             COUNT(b.id) as total_bookings
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.id
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN bookings b ON e.id = b.event_id
      WHERE e.tenant_id = ? AND e.status = ?
    `;

    const params = [req.user.tenant_id, status];

    if (category) {
      query += " AND e.category_id = ?";
      params.push(category);
    }

    if (startDate) {
      query += " AND e.start_date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND e.end_date <= ?";
      params.push(endDate);
    }

    if (location) {
      query += " AND e.location LIKE ?";
      params.push(`%${location}%`);
    }

    query += " GROUP BY e.id LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [events] = await db.query(query, params);

    const [totalCount] = await db.query(
      "SELECT COUNT(*) as count FROM events WHERE tenant_id = ? AND status = ?",
      [req.user.tenant_id, status]
    );

    res.json({
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEvent = async (req, res, next) => {
  try {
    const [event] = await db.query(
      `SELECT e.*, ec.name as category_name,
              u.first_name, u.last_name,
              COUNT(DISTINCT b.id) as total_bookings,
              COUNT(DISTINCT w.id) as total_wishlists
       FROM events e
       LEFT JOIN event_categories ec ON e.category_id = ec.id
       LEFT JOIN users u ON e.organizer_id = u.id
       LEFT JOIN bookings b ON e.id = b.event_id
       LEFT JOIN wishlists w ON e.id = w.event_id
       WHERE e.id = ? AND e.tenant_id = ?
       GROUP BY e.id`,
      [req.params.id, req.user.tenant_id]
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    // const { error } = validateEvent(req.body);
    // if (error) {
    //   return res.status(400).json({ message: error.details[0].message });
    // }

    const {
      category_id,
      title,
      description,
      location,
      venue_address,
      start_date,
      end_date,
      timezone,
      total_tickets,
      ticket_price,
      ticket_types,
    } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        `INSERT INTO events (
          tenant_id, organizer_id, category_id, title, description,
          location, venue_address, start_date, end_date, timezone,
          total_tickets, available_tickets, ticket_price, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.tenant_id,
          req.user.id,
          category_id,
          title,
          description,
          location,
          venue_address,
          start_date,
          end_date,
          timezone,
          total_tickets,
          total_tickets, // Initially available tickets equals total tickets
          ticket_price,
          "draft",
        ]
      );

      const eventId = result.insertId;

      // Insert ticket types if provided
      if (ticket_types && ticket_types.length > 0) {
        const ticketTypeValues = ticket_types.map((type) => [
          eventId,
          type.name,
          type.description,
          type.price,
          type.quantity,
          type.quantity, // Initially available quantity equals total quantity
        ]);

        await connection.query(
          `INSERT INTO ticket_types (
            event_id, name, description, price, quantity, available_quantity
          ) VALUES ?`,
          [ticketTypeValues]
        );
      }

      // Create initial analytics record
      await connection.query(
        "INSERT INTO event_analytics (event_id) VALUES (?)",
        [eventId]
      );

      await connection.commit();

      const [event] = await db.query("SELECT * FROM events WHERE id = ?", [
        eventId,
      ]);

      res.status(201).json(event);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    // const { error } = validateEvent(req.body);
    // if (error) {
    //   return res.status(400).json({ message: error.details[0].message });
    // }

    const [event] = await db.query(
      "SELECT * FROM events WHERE id = ? AND tenant_id = ?",
      [req.params.id, req.user.tenant_id]
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer_id !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this event" });
    }

    const {
      category_id,
      title,
      description,
      location,
      venue_address,
      start_date,
      end_date,
      timezone,
      total_tickets,
      ticket_price,
      status,
    } = req.body;

    await db.query(
      `UPDATE events SET
        category_id = ?,
        title = ?,
        description = ?,
        location = ?,
        venue_address = ?,
        start_date = ?,
        end_date = ?,
        timezone = ?,
        total_tickets = ?,
        ticket_price = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        category_id,
        title,
        description,
        location,
        venue_address,
        start_date,
        end_date,
        timezone,
        total_tickets,
        ticket_price,
        status,
        req.params.id,
      ]
    );

    const [updatedEvent] = await db.query("SELECT * FROM events WHERE id = ?", [
      req.params.id,
    ]);

    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const [event] = await db.query(
      "SELECT * FROM events WHERE id = ? AND tenant_id = ?",
      [req.params.id, req.user.tenant_id]
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer_id !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Delete related records
      await connection.query("DELETE FROM event_analytics WHERE event_id = ?", [
        req.params.id,
      ]);
      await connection.query("DELETE FROM wishlists WHERE event_id = ?", [
        req.params.id,
      ]);
      await connection.query("DELETE FROM notifications WHERE event_id = ?", [
        req.params.id,
      ]);
      await connection.query("DELETE FROM ticket_types WHERE event_id = ?", [
        req.params.id,
      ]);

      // Check for bookings
      const [bookings] = await connection.query(
        'SELECT id FROM bookings WHERE event_id = ? AND status IN ("confirmed", "pending")',
        [req.params.id]
      );

      if (bookings.length > 0) {
        // If there are active bookings, mark the event as cancelled instead of deleting
        await connection.query(
          'UPDATE events SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [req.params.id]
        );
      } else {
        // If no active bookings, delete the event
        await connection.query("DELETE FROM events WHERE id = ?", [
          req.params.id,
        ]);
      }

      await connection.commit();
      res.status(204).end();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

const getEventAnalytics = async (req, res, next) => {
  try {
    const [event] = await db.query(
      "SELECT * FROM events WHERE id = ? AND tenant_id = ?",
      [req.params.id, req.user.tenant_id]
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const [analytics] = await db.query(
      "SELECT * FROM event_analytics WHERE event_id = ?",
      [req.params.id]
    );

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

// Export functions
module.exports = {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
};
