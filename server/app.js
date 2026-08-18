const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes      = require('./src/routes/auth.routes');
const userRoutes      = require('./src/routes/user.routes');
const ethnicGroupRoutes = require('./src/routes/ethnicGroup.routes');
const locationRoutes  = require('./src/routes/location.routes');
const workRoutes      = require('./src/routes/work.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const errorHandler    = require('./src/middleware/error.middleware');

const path = require('path');

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Static uploads fallback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging (dev only)
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/ethnic-groups', ethnicGroupRoutes);
app.use('/api/locations',     locationRoutes);
app.use('/api/works',         workRoutes);
app.use('/api/dashboard',     dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Server is running.' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại.` });
});

// Centralized error handler (must be last)
app.use(errorHandler);

module.exports = app;
