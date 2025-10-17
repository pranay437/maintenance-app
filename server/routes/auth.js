const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, uploadPhoto, updatePhoto, getAllUsers } = require('../controllers/authController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('hostelCode').trim().isLength({ min: 2, max: 10 }),
  body('hostelName').trim().isLength({ min: 2, max: 100 })
], register);

// Login route
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('hostelCode').trim().isLength({ min: 2, max: 10 })
], login);

// Get current user route
router.get('/me', verifyToken, getMe);

// Upload photo route
router.post('/photo', verifyToken, uploadPhoto, updatePhoto);

// Get all users (admin only)
router.get('/users', verifyToken, requireAdmin, getAllUsers);

// Create demo users (development only)
router.post('/create-demo', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not allowed in production' });
  }
  
  try {
    const User = require('../models/User');
    
    const demoUsers = [
      {
        name: 'John Student',
        email: 'john.student@example.com',
        password: 'password123',
        hostelCode: 'HST001',
        hostelName: 'Demo Hostel',
        role: 'student'
      },
      {
        name: 'Admin User',
        email: 'admin@hostel.com',
        password: 'admin123',
        hostelCode: 'HST001',
        hostelName: 'Demo Hostel',
        role: 'admin'
      }
    ];
    
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
      }
    }
    
    res.json({ success: true, message: 'Demo users created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;