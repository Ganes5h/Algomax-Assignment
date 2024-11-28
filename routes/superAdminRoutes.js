const express = require("express");
const {
  registerSuperAdmin,
  loginSuperAdmin,
  getDashboardAnalytics,
} = require("../controllers/superAdminController.js");

const router = express.Router();

router.post("/register", registerSuperAdmin);
router.post("/login", loginSuperAdmin);
router.get("/analytics", getDashboardAnalytics);

module.exports = router;
