import dotenv from 'dotenv';
import app from './app.js';
import logger from './utils/logger.js';
import validateEnv from './utils/validateEnv.js';

// Load environment variables
dotenv.config();

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed', { error: error.message });
  process.exit(1);
}

// Default to 5001 for development, 80 for production
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 5001);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`${signal} signal received: closing HTTP server gracefully`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections and other resources here if needed
    // For example: mongoose.connection.close()
    
    logger.info('Process terminated gracefully');
    process.exit(0);
  });

  // Force close after 30 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason,
    promise: promise,
  });
  gracefulShutdown('UNHANDLED_REJECTION');
});
