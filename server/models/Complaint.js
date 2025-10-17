const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  hostelCode: {
    type: String,
    required: [true, 'Hostel code is required'],
    uppercase: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['electrical', 'plumbing', 'cleaning', 'other'],
      message: 'Category must be one of: electrical, plumbing, cleaning, other'
    }
  },
  photo: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in progress', 'resolved'],
      message: 'Status must be one of: pending, in progress, resolved'
    },
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt field before updating
complaintSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Index for better query performance
complaintSchema.index({ userId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ hostelCode: 1 });
complaintSchema.index({ hostelCode: 1, status: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;