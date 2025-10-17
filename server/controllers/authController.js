const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

exports.uploadPhoto = upload.single('photo');

// REGISTER
exports.register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, hostelCode, hostelName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user (role defaults to 'student')
    const user = await User.create({ 
      name, 
      email, 
      password, 
      hostelCode: hostelCode.toUpperCase(),
      hostelName
    });

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostelCode: user.hostelCode,
        hostelName: user.hostelName
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, hostelCode } = req.body;

    const user = await User.findOne({ 
      email, 
      hostelCode: hostelCode.toUpperCase() 
    }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostelCode: user.hostelCode,
        hostelName: user.hostelName
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPLOAD PHOTO
exports.updatePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete old photo if exists
    if (user.photo) {
      const oldPhotoPath = path.join(__dirname, '../uploads/', user.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update user with new photo
    user.photo = req.file.filename;
    await user.save();

    res.json({
      success: true,
      message: 'Photo updated successfully',
      photo: user.photo
    });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ALL USERS (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ 
      role: 'student',
      hostelCode: req.user.hostelCode
    }).select('-password');
    res.json({ success: true, users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
