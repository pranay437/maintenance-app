# Maintenance Request App for Hostellers and PG Students

A full-stack web application that enables hostel and PG students to submit and track maintenance requests while providing administrators with tools to manage and resolve complaints efficiently.

## Features

### For Students/Residents
- **User Registration & Authentication** - Secure account creation and login
- **Submit Maintenance Requests** - Easy form to report issues
- **Track Request Status** - Real-time status updates (Pending, In Progress, Resolved)
- **Request History** - View all submitted complaints with filtering options
- **Responsive Design** - Works on desktop and mobile devices

### For Administrators
- **Admin Dashboard** - Complete overview of all maintenance requests
- **Manage Complaints** - Update status of requests and assign priorities  
- **User Management** - View student information and complaint history
- **Analytics & Reports** - Statistics on complaint resolution and categories
- **Real-time Updates** - Auto-refreshing data

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcrypt for password hashing, input validation, CORS protection

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm (comes with Node.js)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd maintenance-request-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/maintenance_app

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup
Make sure MongoDB is running on your system:

```bash
# For macOS (using Homebrew)
brew services start mongodb/brew/mongodb-community

# For Ubuntu/Debian
sudo systemctl start mongod

# For Windows
net start MongoDB
```

### 5. Start the Application
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## Demo Accounts

The application comes with pre-configured demo accounts for testing:

### Student Account
- **Email:** `john.student@example.com`
- **Password:** `password123`

### Admin Account
- **Email:** `admin@hostel.com`  
- **Password:** `admin123`

## Project Structure

```
maintenance-request-app/
├── client/                     # Frontend files
│   ├── index.html             # Landing page
│   ├── register.html          # Registration page
│   ├── login.html             # Login page
│   ├── dashboard.html         # Dashboard (student/admin)
│   ├── css/
│   │   └── styles.css         # Main stylesheet
│   └── js/
│       ├── auth.js            # Authentication logic
│       ├── dashboard.js       # Dashboard functionality
│       └── utils.js           # Utility functions
├── server/                    # Backend files
│   ├── server.js              # Express server entry point
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Complaint.js       # Complaint schema
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── complaintController.js # Complaint management
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   └── complaints.js      # Complaint routes
│   └── middleware/
│       └── auth.js            # JWT verification middleware
├── .env                       # Environment variables
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth