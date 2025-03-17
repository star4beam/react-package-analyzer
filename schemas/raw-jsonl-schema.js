/**
 * @fileoverview
 * This file describes the structure of raw.jsonl, which contains
 * detailed component usage analysis data with one JSON object per line.
 * Each line represents a single file's component usage information.
 */

/**
 * @typedef {Object} PropsDetails
 * @property {number} total - Total number of props used
 * @property {string[]} unique - Array of unique prop names
 * @property {Object.<string, number>} details - Map of prop name to usage count
 * @property {Object.<string, PropsCategory>} categories - Props grouped by category
 */

/**
 * @typedef {Object} PropsCategory
 * @property {number} count - Number of props in this category
 * @property {Object.<string, number>} props - Map of prop name to usage count
 */

/**
 * @typedef {Object} ArgsInfo
 * @property {number} count - Number of arguments passed
 * @property {Object.<string, number>} patterns - Patterns of argument usage (e.g. "oneArg": 1)
 */

/**
 * @typedef {Object} ComponentUsage
 * @property {number} imported - Number of times the component was imported
 * @property {number} used - Number of times the component was used
 * @property {number} withClassName - Number of times used with className prop
 * @property {number} withoutClassName - Number of times used without className prop
 * @property {number} withStyle - Number of times used with style prop
 * @property {number} withoutStyle - Number of times used without style prop
 * @property {number} withRef - Number of times used with ref
 * @property {number} withoutRef - Number of times used without ref
 * @property {number} withProps - Number of times used with any props
 * @property {number} totalUsage - Total usage count
 * @property {PropsDetails} props - Detailed information about props usage
 * @property {Object} [booleanProps] - Information about boolean props (optional)
 * @property {number} [booleanProps.count] - Count of boolean props
 * @property {Object.<string, number>} [booleanProps.props] - Map of boolean prop names to usage count
 * @property {number} [withChildren] - Number of times used with children
 * @property {number} [withExplicitChildren] - Number of times used with explicit children prop
 * @property {number} [withoutExplicitChildren] - Number of times used without explicit children prop
 * @property {Object} [childrenTypes] - Types of children used
 * @property {number} [totalChildrenUsage] - Total children usage count
 * @property {ArgsInfo} [args] - Information about arguments (for function components)
 */

/**
 * @typedef {Object} LibraryUsage
 * @property {Object.<string, ComponentUsage>} [componentName] - Usage data for each component from the library
 */

/**
 * @typedef {Object} FileUsageData
 * @property {string} file - Path to the file
 * @property {Object} usage - Component usage data by library

 * @property {string[]} imports - List of other files imported by this file
 * @property {number} totalProps - Total number of props used across all components
 */
