const express = require('express');
const { body, param } = require('express-validator');
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  upload
} = require('../controllers/complaintController');
const { verifyToken, requireAdmin, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Create complaint (student only)
router.post('/create', [
  verifyToken,
  requireStudent,
  upload.single('problemPhoto'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['electrical', 'plumbing', 'cleaning', 'other'])
    .withMessage('Category must be one of: electrical, plumbing, cleaning, other')
], createComplaint);

// Get current user's complaints (student only)
router.get('/my', [verifyToken, requireStudent], getMyComplaints);

// Get all complaints (admin only)
router.get('/all', [verifyToken, requireAdmin], getAllComplaints);

// Update complaint status (admin only)
router.put('/update/:id', [
  verifyToken,
  requireAdmin,
  param('id')
    .isMongoId()
    .withMessage('Invalid complaint ID'),
  body('status')
    .isIn(['pending', 'in progress', 'resolved'])
    .withMessage('Status must be one of: pending, in progress, resolved')
], updateComplaintStatus);

// Delete complaint (admin only)
router.delete('/:id', [
  verifyToken,
  requireAdmin,
  param('id')
    .isMongoId()
    .withMessage('Invalid complaint ID')
], deleteComplaint);

module.exports = router;