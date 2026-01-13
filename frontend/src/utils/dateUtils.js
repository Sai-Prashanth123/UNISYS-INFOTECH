/**
 * US Date/Time Formatting Utilities
 * All dates and times are formatted for US timezone (America/New_York)
 */

const US_TIMEZONE = 'America/New_York';
const US_LOCALE = 'en-US';

/**
 * Format date in US format (MM/DD/YYYY)
 */
export const formatUSDate = (date) => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(US_LOCALE, {
    timeZone: US_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format date and time in US format
 */
export const formatUSDateTime = (date) => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(US_LOCALE, {
    timeZone: US_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format time in US format (12-hour with AM/PM)
 */
export const formatUSTime = (date) => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(US_LOCALE, {
    timeZone: US_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date in US format with month name (e.g., "Jan 15, 2024")
 */
export const formatUSDateLong = (date) => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(US_LOCALE, {
    timeZone: US_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date in US format with full month name (e.g., "January 15, 2024")
 */
export const formatUSDateFull = (date) => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(US_LOCALE, {
    timeZone: US_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get current date in US timezone
 */
export const getUSDate = () => {
  return new Date(new Date().toLocaleString(US_LOCALE, { timeZone: US_TIMEZONE }));
};

/**
 * Format date range in US format
 */
export const formatUSDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'N/A';
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const startFormatted = start.toLocaleDateString(US_LOCALE, {
    timeZone: US_TIMEZONE,
    month: 'short',
    day: 'numeric'
  });
  
  const endFormatted = end.toLocaleDateString(US_LOCALE, {
    timeZone: US_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Format month and year in US format (e.g., "January 2024")
 */
export const formatUSMonthYear = (date) => {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(US_LOCALE, {
    timeZone: US_TIMEZONE,
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Get time ago in US timezone
 */
export const getUSTimeAgo = (date) => {
  if (!date) return '';
  const now = getUSDate();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatUSDateLong(then);
};
