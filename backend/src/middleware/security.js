import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import logger from '../utils/logger.js';

/**
 * Helmet - Security headers
 * Protects against common web vulnerabilities
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow loading resources from other origins
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * General Rate Limiter
 * Limits requests from a single IP to prevent abuse
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    });
  },
});

/**
 * Strict Rate Limiter for Authentication Routes
 * More restrictive to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: false, // Count successful requests
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      email: req.body?.email || 'N/A',
    });
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again after 15 minutes.',
    });
  },
});

/**
 * Password Reset Rate Limiter
 * Prevent abuse of password reset functionality
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  skipSuccessfulRequests: false,
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Password reset rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email || 'N/A',
    });
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts, please try again after 1 hour.',
    });
  },
});

/**
 * Data Sanitization against NoSQL Injection
 * Removes any keys that start with $ or contain .
 */
export const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn('Sanitized potentially malicious data', {
      ip: req.ip,
      path: req.path,
      key,
    });
  },
});

/**
 * XSS Protection Middleware
 * Sanitizes user input to prevent XSS attacks
 */
export const xssProtection = (req, res, next) => {
  // Helper function to sanitize strings
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove script tags and event handlers
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
      .replace(/javascript:/gi, '');
  };

  // Recursively sanitize objects
  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * HTTPS Enforcement Middleware
 * Redirects HTTP requests to HTTPS in production
 * Disabled for Docker/container environments
 */
export const enforceHTTPS = (req, res, next) => {
  // Skip HTTPS enforcement in Docker/container environments or when ENFORCE_HTTPS=false
  if (process.env.ENFORCE_HTTPS === 'false' || process.env.DOCKER === 'true') {
    return next();
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Only enforce HTTPS if we're behind a proxy that sets x-forwarded-proto
    // For local Docker containers, allow HTTP
    if (req.headers['x-forwarded-proto'] === 'https' || req.secure) {
      return next();
    }
    // Skip redirect for localhost/container environments
    if (req.hostname === 'localhost' || req.hostname === '127.0.0.1' || 
        req.headers.host?.includes('localhost') || 
        process.env.ALLOW_HTTP === 'true') {
      return next();
    }
    
    logger.info('Redirecting HTTP to HTTPS', {
      originalUrl: req.originalUrl,
      ip: req.ip,
    });
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  }
  next();
};

/**
 * CORS Validation Middleware
 * Ensures CORS is properly configured for production
 */
export const validateCORS = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.FRONTEND_URL;

  if (process.env.NODE_ENV === 'production') {
    if (origin && allowedOrigin && !origin.includes('localhost') && origin !== allowedOrigin) {
      logger.warn('Blocked request from unauthorized origin', {
        origin,
        allowedOrigin,
        ip: req.ip,
      });
    }
  }

  next();
};

/**
 * Request Logger Middleware
 * Logs all incoming requests
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.http('Request completed', logData);
    }
  });

  next();
};

export default {
  helmetConfig,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  sanitizeData,
  xssProtection,
  enforceHTTPS,
  validateCORS,
  requestLogger,
};
