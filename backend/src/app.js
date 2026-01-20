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

// Trust proxy - important for getting real IPs behind proxies/load balancers
app.set('trust proxy', 1);

// Security Middleware (apply before other middleware)
app.use(enforceHTTPS); // Force HTTPS in production
app.use(helmetConfig); // Security headers
app.use(requestLogger); // Request logging

// CORS Configuration - strict in production
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
// Allow Azure Static Web Apps origin (can have multiple subdomains)
const allowedOrigins = [
  allowedOrigin,
  'https://happy-ocean-08bd11c10.2.azurestaticapps.net', // Azure Static Web App URL
  'http://localhost:5173', // Local development
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In production, check against allowed origins list
    if (process.env.NODE_ENV === 'production') {
      // Check if origin matches any allowed origin or starts with Azure Static Web Apps pattern
      const isAllowed = allowedOrigins.some(allowed => origin === allowed) ||
                       origin.includes('.azurestaticapps.net') ||
                       origin === allowedOrigin;
      
      if (isAllowed) {
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
// Reduced from 10mb to 2mb for better security (can be increased if needed)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Data sanitization
app.use(sanitizeData); // NoSQL injection protection
app.use(xssProtection); // XSS protection

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
