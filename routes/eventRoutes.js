const express = require("express");
const router = express.Router();
const {
  createEvent,
  addEventAdmin,
  getAllPublishedEvents,
  
} = require("../controllers/eventController");
const upload = require("../middleware/EventUpload");

router.post("/create", upload.single("poster"), createEvent);
router.post("/addAdmin", addEventAdmin);
router.get("/getallevents", getAllPublishedEvents);

module.exports = router;
