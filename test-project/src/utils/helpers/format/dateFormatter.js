/**
 * Format a date using the specified format
 * @param {Date} date - The date to format
 * @param {string} format - The format to use
 * @returns {string} The formatted date string
 */
export const formatDate = (date, format = 'MM/DD/YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  
  if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  } else if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  } else if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  }
  
  return `${month}/${day}/${year}`;
};

/**
 * Get relative time string (e.g., "2 days ago")
 * @param {Date} date - The date to format
 * @returns {string} Relative time string
 */
export const getRelativeTimeString = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffInMs = now - d;
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHours = Math.floor(diffInMin / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSec < 60) {
    return 'just now';
  } else if (diffInMin < 60) {
    return `${diffInMin} ${diffInMin === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  return formatDate(d);
}; 