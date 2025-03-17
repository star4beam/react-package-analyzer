/**
 * @fileoverview
 * This file describes the structure of summary.json, which provides high-level statistics
 * about component usage across the entire codebase, organized by package.
 */

/**
 * @typedef {Object} PackageStatistics
 * @property {number} totalImports - Total number of times the package is imported across all files
 * @property {number} totalUsages - Total number of times components from this package are used
 * @property {number} totalComponents - Total count of components used from this package
 * @property {string[]} uniqueComponents - Array of unique component names used from this package
 */

/**
 * @typedef {Object} SummaryData
 * @property {number} totalFiles - Total number of files analyzed
 * @property {number} totalImports - Total number of imports across all files
 * @property {number} totalComponentsUsed - Total number of unique components used across the codebase
 * @property {number} totalPropUsage - Total number of props used across all components
 * @property {Object.<string, PackageStatistics>} packageStats - Statistics grouped by package name
 */

module.exports = {};