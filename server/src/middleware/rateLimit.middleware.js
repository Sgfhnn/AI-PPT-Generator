const { Redis } = require('@upstash/redis');
const { Ratelimit } = require('@upstash/ratelimit');

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Create a new ratelimiter for PPT generation: 2 requests per 24 hours
const pptGenerationRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(2, '24 h'),
    analytics: true,
    prefix: '@upstash/ratelimit/ppt-gen',
});

// General API ratelimiter: 100 requests per minute
const generalRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/general',
});

const pptRateLimitMiddleware = async (req, res, next) => {
    try {
        // Use user ID if available, otherwise fallback to IP
        const identifier = req.user ? req.user.id : (req.ip || req.headers['x-forwarded-for'] || 'anonymous');
        const { success, limit, reset, remaining } = await pptGenerationRatelimit.limit(identifier);

        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', reset);

        if (!success) {
            return res.status(429).json({
                success: false,
                message: 'You have reached the daily limit of 2 presentations. Please try again tomorrow.',
            });
        }

        next();
    } catch (error) {
        console.error('PPT Rate limit error:', error);
        // If rate limiting fails (e.g. Redis down), we still want to allow the request
        next();
    }
};

const generalRateLimitMiddleware = async (req, res, next) => {
    try {
        const identifier = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
        const { success, limit, reset, remaining } = await generalRatelimit.limit(identifier);

        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', reset);

        if (!success) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later.',
            });
        }

        next();
    } catch (error) {
        console.error('General Rate limit error:', error);
        next();
    }
};

module.exports = { pptRateLimitMiddleware, generalRateLimitMiddleware };
