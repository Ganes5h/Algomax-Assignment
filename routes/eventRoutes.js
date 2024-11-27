// const express = require("express");
// const router = express.Router();
// const eventController = require("../controllers/eventController");
// const authMiddleware = require("../middlewares/authMiddleware");

// // List events with pagination and filters
// router.get("/", authMiddleware.verifyToken, eventController.listEvents);

// // Get a single event by ID
// router.get("/:id", authMiddleware.verifyToken, eventController.getEvent);

// // Create a new event
// router.post("/", authMiddleware.verifyToken, eventController.createEvent);

// // Update an event by ID
// router.put("/:id", authMiddleware.verifyToken, eventController.updateEvent);

// // Delete an event by ID
// router.delete("/:id", authMiddleware.verifyToken, eventController.deleteEvent);

// // Get event analytics
// router.get(
//   "/:id/analytics",
//   authMiddleware.verifyToken,
//   eventController.getEventAnalytics
// );

// module.exports = router;

const express = require("express");
const {
  createEvent,
  updateEvent,
  getEvents,
  getEventDetails,
  deleteEvent,
  fetchAllEvents,
} = require("../controllers/eventController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const router = express.Router();

// Create event (only for organizers and admins)
router.post(
  "/:id",
  upload.array("images", 5), // Handles up to 5 files with the field name "images"
  // authenticate,
  // authorize(['organizer', 'admin']),
  createEvent
);

router.get("/fetch-events", fetchAllEvents);

// Update event (only for organizers and admins of the tenant)
router.put(
  "/:eventId",
  // authenticate,
  // authorize(['organizer', 'admin']),
  updateEvent
);

// Get all events (filtered)
router.get(
  "/",
  // authenticate,
  getEvents
);

// Get specific event details
router.get(
  "/:eventId",
  // authenticate,
  getEventDetails
);

// Delete event
router.delete(
  "/:eventId",
  // authenticate,
  // authorize(['organizer', 'admin']),
  deleteEvent
);

module.exports = router;
