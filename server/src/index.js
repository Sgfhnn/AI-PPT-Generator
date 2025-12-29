const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const passport = require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth.routes');
const presentationRoutes = require('./routes/presentation.routes');
const generateRoutes = require('./routes/generate.routes');

const app = express();

// Security middleware
app.enable('trust proxy');
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'https://ai-ppt-generator-iota.vercel.app',
            'https://ai-ppt-generator-iota.vercel.app/'
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            // Check if it matches without trailing slash
            const originWithoutSlash = origin.endsWith('/') ? origin.slice(0, -1) : origin;
            if (allowedOrigins.indexOf(originWithoutSlash) !== -1) {
                return callback(null, true);
            }

            // For development, allow localhost
            if (process.env.NODE_ENV !== 'production') {
                return callback(null, true);
            }

            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/presentations', presentationRoutes);
app.use('/api/generate', generateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AI PPT Generator API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-ppt-generator')
    .then(() => {
        console.log('📦 Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API available at http://localhost:${PORT}/api`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

module.exports = app;
