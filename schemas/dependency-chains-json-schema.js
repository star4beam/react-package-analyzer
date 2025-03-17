/**
 * @fileoverview
 * This file describes the structure of dependency-chains.json, which maps the relationship
 * between files that import components from specific packages and the files that import those files.
 */

/**
 * @typedef {Object} FileImporters
 * @property {string[]} directImporters - Array of file paths that directly import this file
 * @property {string[]} indirectImporters - Array of file paths that indirectly import this file (through other files)
 * @property {number} totalImporters - Total count of importers (direct + indirect)
 */

/**
 * @typedef {Object} PackageFiles
 * @property {Object.<string, FileImporters>} files - Map of file paths to their importer information
 */

/**
 * @typedef {Object} DependencyChains
 * @property {Object.<string, PackageFiles>} [packageName] - Map of package names to their file dependency information
 */

module.exports = {}