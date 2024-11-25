const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Validation middleware
const registerValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("first_name").trim().notEmpty(),
  body("last_name").trim().notEmpty(),
  body("role").optional().isIn(["admin", "organizer", "user"]),
  body("phone").optional().isMobilePhone(),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

// Routes
router.post("/register", authController.register);
router.post("/login", loginValidation, authController.login);
router.post("/logout", authMiddleware.verifyToken, authController.logout);
router.get("/profile", authMiddleware.verifyToken, authController.getProfile);
router.put(
  "/profile",
  authMiddleware.verifyToken,
  authController.updateProfile
);

module.exports = router;
