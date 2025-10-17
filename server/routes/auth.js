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

module.exports = router;