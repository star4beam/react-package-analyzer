/**
 * @fileoverview
 * This file describes the structure of detailed.json, which contains
 * comprehensive information about component usage across files and
 * detailed component statistics.
 */

/**
 * @typedef {Object} FileComponentUsage
 * @property {string} name - Name of the component
 * @property {string} package - Package the component belongs to
 * @property {number} usageCount - Number of times the component is used in the file
 * @property {string[]} props - Array of prop names used with this component in the file
 */

/**
 * @typedef {Object} FileInfo
 * @property {string} path - Path to the file
 * @property {FileComponentUsage[]} componentsUsed - Array of components used in the file
 */

/**
 * @typedef {Object} PropsCategoryInfo
 * @property {number} count - Total number of props in this category
 * @property {Object.<string, number>} props - Map of prop names to usage counts for this category
 */

/**
 * @typedef {Object} ComponentPropsInfo
 * @property {number} total - Total number of props used with this component
 * @property {string[]} unique - Array of unique prop names used with this component
 * @property {Object.<string, number>} details - Map of prop names to usage counts
 * @property {Object.<string, PropsCategoryInfo>} categories - Props grouped by category
 */

/**
 * @typedef {Object} ComponentInfo
 * @property {string} name - Name of the component
 * @property {string} package - Package the component belongs to
 * @property {number} totalImports - Total number of files that import this component
 * @property {number} totalUsages - Total number of times this component is used
 * @property {number} fileCount - Number of files that use this component
 * @property {string[]} files - Array of file paths that use this component
 * @property {ComponentPropsInfo} props - Detailed information about props usage
 */

/**
 * @typedef {Object} DetailedJsonData
 * @property {FileInfo[]} files - Array of file information objects
 * @property {ComponentInfo[]} components - Array of component information objects
 */

module.exports = {};