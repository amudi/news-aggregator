import rateLimit from 'express-rate-limit';

// General API rate limiter
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific rate limiter for news endpoints
export const newsRateLimiter = {
  search: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 search requests per minute
    message: {
      status: 'error',
      message: 'Too many search requests, please try again in a minute.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  getById: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 getById requests per minute
    message: {
      status: 'error',
      message: 'Too many article requests, please try again in a minute.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
};
