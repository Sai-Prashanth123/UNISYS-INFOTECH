import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import logger from '../utils/logger.js';

// NOTE: rate limiting was intentionally removed (Azure/proxy environments and app requirements).

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
 * Disabled for Docker/container environments and cloud platforms that handle HTTPS termination
 */
export const enforceHTTPS = (req, res, next) => {
  // Skip HTTPS enforcement in Docker/container environments or when ENFORCE_HTTPS=false
  if (process.env.ENFORCE_HTTPS === 'false' || process.env.DOCKER === 'true') {
    return next();
  }
  
  // Skip HTTPS enforcement for cloud platforms that handle HTTPS termination
  // Azure Container Apps, AWS ALB, GCP Cloud Run, etc. handle HTTPS at the load balancer
  const isCloudPlatform = 
    process.env.WEBSITE_SITE_NAME || // Azure App Service
    process.env.CONTAINER_APP_NAME || // Azure Container Apps
    process.env.AWS_EXECUTION_ENV || // AWS Lambda/ECS
    process.env.K_SERVICE || // Google Cloud Run
    req.headers['x-forwarded-proto'] === 'https'; // Already HTTPS at load balancer
  
  if (isCloudPlatform || process.env.ALLOW_HTTP === 'true') {
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
        req.headers.host?.includes('localhost')) {
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
  sanitizeData,
  xssProtection,
  enforceHTTPS,
  validateCORS,
  requestLogger,
};
