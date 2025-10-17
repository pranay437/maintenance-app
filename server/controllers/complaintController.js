const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'complaint-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed'));
    }
  }
});

// Create new complaint
const createComplaint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, category } = req.body;
    const userId = req.user._id;
    const hostelCode = req.user.hostelCode;
    const photo = req.file ? req.file.filename : null;

    const complaint = new Complaint({
      userId,
      hostelCode,
      title,
      description,
      category,
      photo
    });

    await complaint.save();
    await complaint.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get current user's complaints
const getMyComplaints = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { userId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      complaints,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: complaints.length,
        totalComplaints: total
      }
    });
  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get all complaints (admin only)
const getAllComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { hostelCode: req.user.hostelCode };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments(filter);

    const stats = await Complaint.aggregate([
      { $match: { hostelCode: req.user.hostelCode } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statistics = {
      total: await Complaint.countDocuments({ hostelCode: req.user.hostelCode }),
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      inProgress: stats.find(s => s._id === 'in progress')?.count || 0,
      resolved: stats.find(s => s._id === 'resolved')?.count || 0
    };

    res.json({
      success: true,
      complaints,
      statistics,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: complaints.length,
        totalComplaints: total
      }
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching all complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update complaint status (admin only)
const updateComplaintStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'in progress', 'resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('userId', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating complaint status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Delete complaint (admin only)
const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    await Complaint.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  upload
};
