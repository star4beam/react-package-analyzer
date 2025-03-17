const ImportAnalyzerConfig = require('./config/Config')
const ImportAnalyzer = require('./analyzers/ImportAnalyzer')

function createTransform(options = {}) {
    const config = new ImportAnalyzerConfig(options)
    
    return function transform(fileInfo, api) {
        // Get file extension to determine if it's a TypeScript file
        const fileExtension = fileInfo.path.split('.').pop().toLowerCase()
        const isTypeScript = ['ts', 'tsx'].includes(fileExtension)
        
        // Configure parser plugins based on file type
        const plugins = [
            'jsx',                    // Always include JSX support
            'classProperties',
            'decorators-legacy',
            'exportDefaultFrom',
            'exportNamespaceFrom',
            'dynamicImport',
            'nullishCoalescingOperator',
            'objectRestSpread',
            'optionalChaining',
            'asyncGenerators',
            'bigInt',
            'classPrivateProperties',
            'classPrivateMethods',
            'importMeta',
            'numericSeparator',
            'optionalCatchBinding',
            'topLevelAwait'
        ]
        
        // Add TypeScript support if needed
        if (isTypeScript) {
            plugins.push('typescript')
        }
        
        try {
            // Configure jscodeshift with parser options
            const j = api.jscodeshift.withParser('babel', {
                sourceType: 'module',
                plugins: plugins,
                tokens: true,       // Include tokens for better analysis
                allowImportExportEverywhere: true, // Allow import/export statements anywhere
                allowReturnOutsideFunction: true,  // More permissive parsing
                allowSuperOutsideMethod: true      // More permissive parsing
            })
            
            const analyzer = new ImportAnalyzer(config)
            return analyzer.analyzeFile(fileInfo, { jscodeshift: j })
        } catch (error) {
            console.error(`Error processing file ${fileInfo.path}: ${error.message}`)
            // Return unchanged file content in case of error to prevent data loss
            return fileInfo.source
        }
    }
}

module.exports = {
    createTransform,
    ImportAnalyzerConfig,
    ImportAnalyzer
} 