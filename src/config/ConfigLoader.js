const fs = require('fs')
const path = require('path')

/**
 * Loads a custom configuration file
 * @param {string} configPath - Path to the configuration file
 * @returns {object|null} The loaded configuration or null
 */
function loadCustomConfig(configPath) {
    // Default config path
    const defaultConfigPath = path.join(process.cwd(), 'react-import-analyzer.config.js')
    
    // Try to load specified config file or default
    const configFile = configPath || defaultConfigPath
    
    try {
        if (fs.existsSync(configFile)) {
            return require(configFile)
        }
    } catch (error) {
        console.warn('Could not load custom config:', error.message)
    }
    
    return null
}

/**
 * Merges configuration objects with precedence: CLI options > custom config > defaults
 * @param {object} cliOptions - Command line options
 * @param {object} customConfig - Custom configuration from file
 * @returns {object} The merged configuration
 */
function mergeConfigs(cliOptions = {}, customConfig = null) {
    // Default configuration
    const defaultConfig = {
        packagesToTrack: [],
        aliasMap: {},
        include: 'src/**/*.{js,jsx,ts,tsx}',
        exclude: ['node_modules/**/*', 'dist/**/*'],
        outputDir: './import-analysis',
        format: 'json,markdown'
    }

    // Merge in order: defaults <- custom config <- CLI options
    const finalConfig = {
        ...defaultConfig,
        ...customConfig,
        ...cliOptions
    }

    // Ensure packagesToTrack is an array
    if (typeof finalConfig.packagesToTrack === 'string') {
        finalConfig.packagesToTrack = [finalConfig.packagesToTrack]
    }

    // Ensure exclude is an array
    if (!Array.isArray(finalConfig.exclude)) {
        finalConfig.exclude = [finalConfig.exclude]
    }

    return finalConfig
}

module.exports = {
    loadCustomConfig,
    mergeConfigs
} 