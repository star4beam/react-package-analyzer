const path = require('path')
const { cosmiconfigSync } = require('cosmiconfig')
const fs = require('fs')

/**
 * Configuration class for the Import Analyzer
 */
class ImportAnalyzerConfig {
    constructor(options = {}) {
        this.packagesToTrack = new Set(options.packagesToTrack || [])
        this.aliasMap = options.aliasMap || {}
        this.tempFilePath = options.tempFilePath || 'temp_import_analysis.jsonl'
        this.reportFilePath = options.reportFilePath || 'import_analysis_report.json'
        this.include = options.include
        this.exclude = options.exclude
        // Try to load aliases from jsconfig/tsconfig if not provided
        if (Object.keys(this.aliasMap).length === 0) {
            this.aliasMap = this.loadAliasesFromConfig()
        }
    }

    loadAliasesFromConfig() {
        const aliasMap = {}
        
        // Try direct file loading first for more reliable results
        try {
            // Check for jsconfig.json
            const jsconfigPath = path.resolve(process.cwd(), 'jsconfig.json')
            if (fs.existsSync(jsconfigPath)) {
                const jsconfigContent = fs.readFileSync(jsconfigPath, 'utf8')
                const jsconfig = JSON.parse(jsconfigContent)
                Object.assign(aliasMap, this.parseConfigPaths(jsconfig))
                console.log('Loaded path aliases from jsconfig.json')
                return aliasMap
            }
            
            // Check for tsconfig.json
            const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json')
            if (fs.existsSync(tsconfigPath)) {
                const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8')
                const tsconfig = JSON.parse(tsconfigContent)
                Object.assign(aliasMap, this.parseConfigPaths(tsconfig))
                console.log('Loaded path aliases from tsconfig.json')
                return aliasMap
            }
        } catch (directError) {
            console.warn('Error loading config files directly:', directError.message)
        }
        
        // Fall back to cosmicconfig as a secondary approach
        try {
            // Try to load jsconfig using cosmiconfig
            const jsconfigExplorer = cosmiconfigSync('jsconfig')
            const jsconfigResult = jsconfigExplorer.search()
            
            if (jsconfigResult && jsconfigResult.config) {
                Object.assign(aliasMap, this.parseConfigPaths(jsconfigResult.config))
                console.log('Loaded path aliases from jsconfig using cosmiconfig')
                return aliasMap
            }
            
            // Fallback to tsconfig using cosmiconfig
            const tsconfigExplorer = cosmiconfigSync('tsconfig')
            const tsconfigResult = tsconfigExplorer.search()
            
            if (tsconfigResult && tsconfigResult.config) {
                Object.assign(aliasMap, this.parseConfigPaths(tsconfigResult.config))
                console.log('Loaded path aliases from tsconfig using cosmiconfig')
                return aliasMap
            }
        } catch (error) {
            console.warn('Could not load path aliases from config files using cosmiconfig:', error.message)
        }
        
        return aliasMap
    }

    parseConfigPaths(config) {
        if (!config || !config.compilerOptions) {
            return {}
        }
        
        const paths = config.compilerOptions.paths || {}
        const baseUrl = config.compilerOptions.baseUrl || '.'
        const basePath = path.resolve(process.cwd(), baseUrl)
        
        const aliasMap = {}
        for (const [key, value] of Object.entries(paths)) {
            if (Array.isArray(value) && value.length > 0) {
                // Handle different path formats: with and without wildcards
                const alias = key.endsWith('/*') 
                    ? key.slice(0, -2) // Remove '/*'
                    : key
                
                const targetPath = value[0].endsWith('/*')
                    ? value[0].slice(0, -2) // Remove '/*' 
                    : value[0]
                
                // Resolve path relative to baseUrl
                const resolvedTarget = path.resolve(basePath, targetPath)
                
                aliasMap[alias] = resolvedTarget
                console.log(`Mapped alias "${alias}" to "${resolvedTarget}"`)
            }
        }
        
        return aliasMap
    }
}

module.exports = ImportAnalyzerConfig 