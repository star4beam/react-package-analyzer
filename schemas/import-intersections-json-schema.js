/**
 * @fileoverview
 * This file describes the structure of import-intersections.json, which contains
 * analysis of component import relationships and intersections between different libraries.
 * 
 * The import-intersections analysis focuses on:
 * - Identifying components that import from multiple libraries/packages (intersections)
 * - Tracking import chains to understand dependency relationships
 * - Discovering global import hubs (components heavily imported throughout the codebase)
 * - Categorizing components based on their role in the dependency graph
 * - Providing metrics on component reuse and dependency relationships
 * 
 * This analysis is designed to be library-agnostic and application-agnostic,
 * focusing objectively on usage patterns without favoring specific frameworks.
 */

/**
 * @typedef {Object} ImportChain
 * @property {string[]} path - Array of file paths showing the import chain from source to destination
 * @property {string[]} packages - Array of package names imported in this chain, showing external dependencies
 */

/**
 * @typedef {Object} GroupedImportChain
 * @property {string} path - File path of the component
 * @property {string} name - Component name
 * @property {number} chainCount - Number of import chains for this component
 * @property {ImportChain[]} chains - Array of import chains for this component, showing how it's used
 */

/**
 * @typedef {Object} IntersectionImporter
 * @property {string} path - File path of the component 
 * @property {string} name - Component name
 * @property {number} directImporterImportsCount - Number of direct imports from this component
 * @property {number} indirectImporterImportsCount - Number of indirect imports from this component
 * @property {ImportChain[]} indirectImportChains - Array of indirect import chains showing extended dependencies
 * @property {GroupedImportChain[]} groupedImportChains - Import chains grouped by component for easier analysis
 */

/**
 * @typedef {Object} GlobalImportHub
 * @property {string} path - File path of the hub component
 * @property {string} name - Hub component name
 * @property {number} usedByIntersectionsCount - Number of intersection components using this hub
 * @property {string[]} usedByIntersections - Array of file paths for components that use this hub
 * @property {number} totalChainCount - Total number of import chains using this hub
 * @property {string[]} packages - Array of packages imported by this hub
 * @property {Object[]} dependencyPaths - Array of dependencies for this hub
 */

/**
 * @typedef {Object} HubInfo
 * @property {string} path - File path of the hub component
 * @property {string} name - Hub component name
 * @property {number} totalIntersectionsUsingThisHub - Number of intersections using this hub
 * @property {number} chainsCount - Number of import chains for this hub
 * @property {string[]} packages - Array of packages imported by this hub
 * @property {Object[]} dependencyPaths - Array of dependencies for this hub
 * @property {string} dependencyPaths[].path - File path of the dependency
 * @property {string} dependencyPaths[].name - Name of the dependency
 * @property {string[]} dependencyPaths[].packages - Packages imported by the dependency
 */

/**
 * @typedef {Object} IntersectionHubs
 * @property {string} name - Intersection component name
 * @property {number} hubsCount - Number of hubs used by this intersection
 * @property {HubInfo[]} hubs - Array of hubs used by this intersection
 */

/**
 * @typedef {Object} HubDependency
 * @property {string} name - Hub component name
 * @property {Object[]} dependsOn - Array of components this hub depends on
 * @property {string} dependsOn[].path - File path of the dependency
 * @property {string} dependsOn[].name - Name of the dependency
 */

/**
 * @typedef {Object} HubUsageInfo
 * @property {string} name - Hub component name
 * @property {Object[]} usedBy - Array of components that use this hub
 * @property {string} usedBy[].path - File path of the component using this hub
 * @property {string} usedBy[].name - Name of the component using this hub
 */

/**
 * @typedef {Object} HubCategory
 * @property {string} path - File path of the hub component
 * @property {string} name - Hub component name
 */

/**
 * @typedef {Object} HubCategorization
 * @property {HubCategory[]} baseHubs - Components that are only used by other hubs (foundation components)
 * @property {HubCategory[]} mainHubs - Components that only depend on other hubs (consumer components)
 * @property {HubCategory[]} intermediateHubs - Components that both use and are used by other hubs (middleware components)
 */

/**
 * @typedef {Object} ImportIntersectionsData
 * @property {IntersectionImporter[]} intersectionImporters - Components that import from intersecting packages
 * @property {GlobalImportHub[]} globalImportHubs - Components that are heavily used by other components
 * @property {Object.<string, IntersectionHubs>} globalImportHubByIntersection - How each intersection uses import hubs
 * @property {Object.<string, HubDependency>} hubDependencies - Dependencies between hubs, showing component relationships
 * @property {Object.<string, HubUsageInfo>} hubUsage - Which components use which hubs, showing component consumption patterns
 * @property {HubCategorization} hubCategories - Categorization of hubs by their role in the dependency graph
 */

/**
 * Example structure of import-intersections.json:
 * 
 * {
 *   "intersectionImporters": [
 *     {
 *       "path": "src/components/common/SomeCommonComponent/index.jsx",
 *       "name": "SomeCommonComponent",
 *       "directImporterImportsCount": 1,
 *       "indirectImporterImportsCount": 0,
 *       "indirectImportChains": [...],
 *       "groupedImportChains": [...]
 *     }
 *   ],
 *   "globalImportHubs": [...],
 *   "globalImportHubByIntersection": {
 *     "src/components/common/SomeCommonComponent/index.jsx": {
 *       "name": "SomeCommonComponent",
 *       "hubsCount": 2,
 *       "hubs": [...]
 *     }
 *   },
 *   "hubDependencies": {
 *     "src/components/common/Toast/index.jsx": {
 *       "name": "Toast",
 *       "dependsOn": [...]
 *     }
 *   },
 *   "hubUsage": {
 *     "src/components/common/Modal/index.jsx": {
 *       "name": "Modal",
 *       "usedBy": [...]
 *     }
 *   },
 *   "hubCategories": {
 *     "baseHubs": [...],
 *     "mainHubs": [...],
 *     "intermediateHubs": [...]
 *   }
 * }
 */

// This is a schema description file and does not contain executable code
module.exports = {} 