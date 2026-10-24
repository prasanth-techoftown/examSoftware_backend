import rateLimit from 'express-rate-limit'

export const LoginRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const retryAfter = res.getHeader('Retry-After')

        res.status(429).json({
            status: 429,
            message: 'Too many login attempts.',
            retryAfter: retryAfter ? Number(retryAfter) : 600,
        })
    },
})
