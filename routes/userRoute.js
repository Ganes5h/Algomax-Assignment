const express = require ('express');
const { 
  registerUser, 
  loginUser, 
  resetPassword 
}= require ('../controllers/userController.js');
const { 
  authenticate, 
  authorize 
} = require ('../middlewares/authMiddleware.js');

const router = express.Router();

// Public registration route
router.post('/register', registerUser);

// Public login route
router.post('/login', loginUser);

// Protected password reset route (user must be authenticated)
router.post('/reset-password', 
  authenticate, 
  resetPassword
);

module.exports=  router;