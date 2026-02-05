import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import hoursRoutes from './routes/hoursRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import clientLogoRoutes from './routes/clientLogoRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import timeCardRoutes from './routes/timeCardRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import contactMessageRoutes from './routes/contactMessageRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import passwordChangeRoutes from './routes/passwordChangeRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import {
  helmetConfig,
  generalLimiter,
  sanitizeData,
  xssProtection,
  enforceHTTPS,
  validateCORS,
  requestLogger,
} from './middleware/security.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();

// Connect to Supabase
connectDB();

// Trust proxy - important for rate limiting and getting real IPs behind proxies/load balancers
app.set('trust proxy', 1);

// Security Middleware (apply before other middleware)
app.use(enforceHTTPS); // Force HTTPS in production
app.use(helmetConfig); // Security headers
app.use(requestLogger); // Request logging

// Production frontend URL – only this origin allowed in production (no localhost)
const PRODUCTION_FRONTEND_URL = 'https://www.unisysinfotech.com';

// CORS Configuration - strict in production
const parseAllowedOrigins = () => {
  const raw = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS, // comma-separated
    process.env.ALLOWED_ORIGINS, // comma-separated
  ]
    .filter(Boolean)
    .join(',');

  let origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === 'production') {
    // Production: only use production URL, ensure it is in the list
    if (!origins.includes(PRODUCTION_FRONTEND_URL)) origins.push(PRODUCTION_FRONTEND_URL);
    origins = origins.filter((o) => !o.includes('localhost') && !o.includes('azurestaticapps.net'));
  } else {
    origins.push('http://localhost:5173', 'http://localhost:3000');
  }

  return [...new Set(origins)];
};

const allowedOrigins = parseAllowedOrigins();
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In production, strictly enforce allowed origin
    if (process.env.NODE_ENV === 'production') {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('Blocked CORS request from unauthorized origin', { origin, allowedOrigins });
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(validateCORS); // Additional CORS validation

// Body parser with size limits
// Increased to support base64 document uploads (SOW files). Keep this as low as practical.
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Data sanitization
app.use(sanitizeData); // NoSQL injection protection
app.use(xssProtection); // XSS protection

// General rate limiting (applied to all routes)
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/timecards', timeCardRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/hours', hoursRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/client-logos', clientLogoRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/contact-messages', contactMessageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/password-change', passwordChangeRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };

    // Check database connection if requested
    if (req.query.detailed === 'true') {
      try {
        const { default: supabase } = await import('./config/supabase.js');
        const { error } = await supabase.from('users').select('id').limit(1);
        health.database = error ? 'error' : 'connected';
        if (error) {
          health.databaseError = error.message;
        }
      } catch (dbError) {
        health.database = 'error';
        health.databaseError = dbError.message;
      }
    }

    const statusCode = health.database === 'error' ? 503 : 200;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
