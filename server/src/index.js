const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
require('./config/passport');

const authRoutes = require('./routes/auth.routes');
const presentationRoutes = require('./routes/presentation.routes');
const generateRoutes = require('./routes/generate.routes');
const { generalRateLimitMiddleware } = require('./middleware/rateLimit.middleware');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:3000',
        'https://ai-ppt-generator-iota.vercel.app'
    ])
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

app.enable('trust proxy');
app.use(helmet());

app.use(cors({
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        const normalizedOrigin = origin.replace(/\/$/, '');

        if (process.env.NODE_ENV === 'production' && !allowedOrigins.includes(normalizedOrigin)) {
            return callback(new Error('The CORS policy for this site does not allow access from the specified origin.'), false);
        }

        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', generalRateLimitMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/presentations', presentationRoutes);
app.use('/api/generate', generateRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AI PPT Generator API is running',
        timestamp: new Date().toISOString()
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-ppt-generator';

const maskedURI = MONGODB_URI.replace(/:([^:@]+)@/, ':******@');
console.log(`Connecting to MongoDB at: ${maskedURI}`);

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`👉 API available at http://localhost:${PORT}/api`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.stack || err.message || err);
        // Delay exiting by 2 seconds to give Render logs time to flush stdout/stderr
        setTimeout(() => {
            process.exit(1);
        }, 2000);
    });

module.exports = app;
