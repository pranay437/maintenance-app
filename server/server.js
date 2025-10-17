// =============================
// 🌐 Maintenance App Backend
// =============================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

const app = express();

// =============================
// 🔒 Security & Middleware
// =============================

// Allow frontend to connect (you can change "*" to your React app URL)
app.use(cors({ origin: "*" }));

// Helmet for basic security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "http://localhost:3001", "https://localhost:3001", "http://localhost:5000", "https://localhost:5000"],
      },
    },
  })
);

// Log requests
app.use(morgan('combined'));

// Parse JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =============================
// ⚙️ Connect to MongoDB
// =============================

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ MongoDB URI not found in .env file');
    return;
  }

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
};

connectDB();

// =============================
// ⚙️ Rate Limiting (optional for production)
// =============================
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP
  });
  app.use(limiter);
}

// =============================
// 📁 Static Files (Frontend)
// =============================
app.use(express.static(path.join(__dirname, '../client')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================
// 🚦 API Routes
// =============================
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// =============================
// 🧭 HTML Pages
// =============================
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dashboard.html'));
});

// =============================
// 🧪 Health Check
// =============================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not Set'
    },
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// =============================
// 🧪 Test MongoDB Connection
// =============================
app.get('/test', async (req, res) => {
  try {
    if (!mongoose.connection.db) throw new Error('MongoDB not connected');
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({
      success: true,
      message: 'Server and MongoDB are working!',
      collections: collections.map(col => col.name),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'MongoDB connection error',
      error: err.message,
    });
  }
});

// 404 handler for API only
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// =============================
// ⚠️ Error Handling Middleware
// =============================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// =============================
// 🌍 Fallback for Frontend Routes
// =============================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// =============================
// 🚀 Start Server
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
