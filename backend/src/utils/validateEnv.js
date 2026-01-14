import logger from './logger.js';

/**
 * Validate required environment variables
 * Throws an error if any required variables are missing
 */
export const validateEnv = () => {
  const required = [
    'SUPABASE_URL',
    'JWT_SECRET',
  ];

  const recommended = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'FRONTEND_URL',
    'NODE_ENV',
    'PORT',
  ];

  const missing = [];
  const missingRecommended = [];

  // Check required variables
  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check recommended variables
  recommended.forEach(varName => {
    if (!process.env[varName]) {
      missingRecommended.push(varName);
    }
  });

  // Fail if required variables are missing
  if (missing.length > 0) {
    logger.error('❌ Missing required environment variables:', { missing });
    logger.error('Please set the following variables in your .env file:');
    missing.forEach(varName => {
      logger.error(`  - ${varName}`);
    });
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn if recommended variables are missing
  if (missingRecommended.length > 0) {
    logger.warn('⚠️  Missing recommended environment variables:', { missingRecommended });
    logger.warn('Consider setting the following variables:');
    missingRecommended.forEach(varName => {
      logger.warn(`  - ${varName}`);
    });
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    logger.warn('⚠️  JWT_SECRET should be at least 32 characters long for security');
  }

  // Validate NODE_ENV
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    logger.warn(`⚠️  Invalid NODE_ENV: ${process.env.NODE_ENV}. Should be 'development', 'production', or 'test'`);
  }

  // Check for production-specific requirements
  if (process.env.NODE_ENV === 'production') {
    const productionRequired = ['SUPABASE_SERVICE_ROLE_KEY', 'FRONTEND_URL'];
    const productionMissing = productionRequired.filter(varName => !process.env[varName]);
    
    if (productionMissing.length > 0) {
      logger.error('❌ Missing required production environment variables:', { productionMissing });
      throw new Error(`Missing required production variables: ${productionMissing.join(', ')}`);
    }

    // Warn about development values in production
    if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.includes('localhost')) {
      logger.warn('⚠️  FRONTEND_URL contains "localhost" in production environment');
    }

    if (process.env.SUPABASE_URL && process.env.SUPABASE_URL.includes('localhost')) {
      logger.warn('⚠️  SUPABASE_URL contains "localhost" in production environment');
    }
  }

  logger.info('✅ Environment variables validated successfully');
  return true;
};

export default validateEnv;
