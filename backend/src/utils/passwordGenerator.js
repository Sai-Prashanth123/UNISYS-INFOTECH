import crypto from 'crypto';

/**
 * Generate a secure random password
 * @param {number} length - Length of the password (default: 16)
 * @param {object} options - Options for password generation
 * @returns {string} Generated password
 */
export const generateSecurePassword = (length = 16, options = {}) => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charset = '';
  let password = '';

  // Build charset based on options
  if (includeUppercase) charset += uppercase;
  if (includeLowercase) charset += lowercase;
  if (includeNumbers) charset += numbers;
  if (includeSymbols) charset += symbols;

  if (charset.length === 0) {
    throw new Error('At least one character type must be enabled');
  }

  // Ensure at least one character from each enabled type
  if (includeUppercase) {
    password += uppercase[crypto.randomInt(0, uppercase.length)];
  }
  if (includeLowercase) {
    password += lowercase[crypto.randomInt(0, lowercase.length)];
  }
  if (includeNumbers) {
    password += numbers[crypto.randomInt(0, numbers.length)];
  }
  if (includeSymbols) {
    password += symbols[crypto.randomInt(0, symbols.length)];
  }

  // Fill remaining length with random characters from charset
  const remainingLength = length - password.length;
  for (let i = 0; i < remainingLength; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }

  // Shuffle the password to avoid predictable patterns
  password = password
    .split('')
    .sort(() => crypto.randomInt(0, 2) - 0.5)
    .join('');

  return password;
};

/**
 * Generate a temporary password for user accounts
 * Format: Strong 12-character password with all character types
 * @returns {string} Generated temporary password
 */
export const generateTempPassword = () => {
  return generateSecurePassword(12, {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });
};

/**
 * Generate a secure token for password reset, email verification, etc.
 * @param {number} bytes - Number of random bytes (default: 32)
 * @returns {string} Generated token (hex string)
 */
export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with strength score and feedback
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: [],
  };

  if (!password) {
    result.feedback.push('Password is required');
    return result;
  }

  // Check length
  if (password.length < 6) {
    result.feedback.push('Password must be at least 6 characters long');
  } else if (password.length >= 6 && password.length < 8) {
    result.score += 1;
    result.feedback.push('Consider using a longer password (8+ characters)');
  } else if (password.length >= 8 && password.length < 12) {
    result.score += 2;
  } else {
    result.score += 3;
  }

  // Check for uppercase
  if (/[A-Z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Add uppercase letters for stronger password');
  }

  // Check for lowercase
  if (/[a-z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Add lowercase letters for stronger password');
  }

  // Check for numbers
  if (/[0-9]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('Add numbers for stronger password');
  }

  // Check for symbols
  if (/[^A-Za-z0-9]/.test(password)) {
    result.score += 2;
  } else {
    result.feedback.push('Add special characters for stronger password');
  }

  // Check for common patterns
  const commonPatterns = ['123', 'abc', 'qwerty', 'password', 'admin'];
  const lowerPassword = password.toLowerCase();
  if (commonPatterns.some(pattern => lowerPassword.includes(pattern))) {
    result.score -= 2;
    result.feedback.push('Avoid common patterns like "123", "abc", "password"');
  }

  // Determine validity
  result.isValid = result.score >= 4 && password.length >= 6;

  // Add strength label
  if (result.score >= 8) {
    result.strength = 'strong';
  } else if (result.score >= 6) {
    result.strength = 'moderate';
  } else if (result.score >= 4) {
    result.strength = 'weak';
  } else {
    result.strength = 'very weak';
  }

  if (result.feedback.length === 0 && result.isValid) {
    result.feedback.push('Strong password!');
  }

  return result;
};

export default {
  generateSecurePassword,
  generateTempPassword,
  generateSecureToken,
  validatePasswordStrength,
};
