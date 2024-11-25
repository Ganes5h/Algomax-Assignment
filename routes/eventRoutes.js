const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const authMiddleware = require("../middlewares/authMiddleware");

// List events with pagination and filters
router.get("/", authMiddleware.verifyToken, eventController.listEvents);

// Get a single event by ID
router.get("/:id", authMiddleware.verifyToken, eventController.getEvent);

// Create a new event
router.post("/", authMiddleware.verifyToken, eventController.createEvent);

// Update an event by ID
router.put("/:id", authMiddleware.verifyToken, eventController.updateEvent);

// Delete an event by ID
router.delete("/:id", authMiddleware.verifyToken, eventController.deleteEvent);

// Get event analytics
router.get(
  "/:id/analytics",
  authMiddleware.verifyToken,
  eventController.getEventAnalytics
);

module.exports = router;
