import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about our colors
winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : process.env.LOG_LEVEL || 'info';
};

// Define transports
const transports = [];

// Console transport - always enabled
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
  })
);

// File transports - only in production or if LOG_FILE is set
if (process.env.NODE_ENV === 'production' || process.env.LOG_FILE) {
  const logDir = path.join(__dirname, '../../logs');
  
  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: format,
    })
  );

  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: format,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object for morgan
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

// Helper function to sanitize sensitive data from logs
export const sanitizeLogData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'jwt', 'secret', 'apiKey', 'api_key'];
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  
  return sanitized;
};

// Wrapper functions for backward compatibility with console.log
export const log = {
  error: (message, ...args) => logger.error(message, sanitizeLogData(args)),
  warn: (message, ...args) => logger.warn(message, sanitizeLogData(args)),
  info: (message, ...args) => logger.info(message, sanitizeLogData(args)),
  http: (message, ...args) => logger.http(message, sanitizeLogData(args)),
  debug: (message, ...args) => logger.debug(message, sanitizeLogData(args)),
};

export default logger;
