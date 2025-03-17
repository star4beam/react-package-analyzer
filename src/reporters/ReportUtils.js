/**
 * Utility functions for generating reports
 */

/**
 * Simplifies a file path by showing only the first 3 and last 3 parts for long paths
 * @param {string} filePath - The file path to simplify
 * @returns {string} The simplified file path
 */
const simplifyFilePath = (filePath) => {
    if (!filePath) return ''
    
    const parts = filePath.split('/')
    
    // Always show the full path if 6 parts or fewer
    if (parts.length <= 6) return filePath
    
    // For longer paths, show first 3 and last 3 parts
    const firstThree = parts.slice(0, 3).join('/')
    const lastThree = parts.slice(-3).join('/')
    
    return `${firstThree}/.../${lastThree}`
}

/**
 * Creates a markdown link to a file with simplified path display but full path in the link
 * @param {string} filePath - The file path to create a link for
 * @param {string} repoUrl - Base repository URL (optional)
 * @returns {string} Markdown link to the file
 */
const createFileLink = (filePath, baseUrl = '') => {
    if (!filePath) return ''
    
    const simplifiedPath = simplifyFilePath(filePath)
    
    // If baseUrl is provided, create a full URL to the file
    const link = baseUrl ? `${baseUrl}/${filePath}` : `/${filePath}`
    
    // Format as a markdown link
    return `[${simplifiedPath}](${link})`
}

/**
 * Creates a safe anchor ID from text by replacing non-alphanumeric characters with dashes
 * @param {string} text - The text to convert to a safe anchor ID
 * @returns {string} Safe anchor ID
 */
const createSafeAnchor = (text) => {
    return text
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/**
 * Sanitizes a package name for use in filenames by replacing forward slashes with underscores
 * @param {string} packageName - The package name to sanitize
 * @returns {string} Sanitized package name
 */
const sanitizePackageName = (packageName) => {
    return packageName.replace(/\//g, '_')
}

/**
 * Formats a category name from camelCase to Title Case with spaces
 * @param {string} category - The category name in camelCase
 * @returns {string} Formatted category name in Title Case
 */
const formatCategoryName = (category) => {
    if (!category) return 'Unknown'
    
    // Convert camelCase to Title Case with spaces
    return category
        .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .trim()
}

/**
 * Generates a simple ASCII bar chart
 * @param {number} value - The value to represent
 * @param {number} total - The total possible value
 * @param {number} maxLength - Maximum length of the bar chart
 * @returns {string} ASCII bar chart
 */
const generateBarChart = (value, total, maxLength = 20) => {
    if (!total || total === 0) return '|'
    const percentage = value / total
    const numBars = Math.round(percentage * maxLength)
    return '█'.repeat(numBars) + ' '.repeat(Math.max(0, maxLength - numBars))
}

/**
 * Creates a markdown link with the given text and URL
 * @param {string} text - The text to display for the link
 * @param {string} url - The URL or path for the link
 * @returns {string} Formatted markdown link
 */
const createMarkdownLink = (text, url) => {
    if (!text || !url) return text || ''
    return `[${text}](${url})`
}

module.exports = {
    simplifyFilePath,
    createFileLink,
    createSafeAnchor,
    sanitizePackageName,
    formatCategoryName,
    generateBarChart,
    createMarkdownLink
} 