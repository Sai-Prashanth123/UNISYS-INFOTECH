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

dotenv.config();

const app = express();

// Connect to Supabase
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
// Increase payload limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
