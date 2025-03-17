const path = require('path')

/**
 * Helper function to extract imports from content using a regex pattern
 * @private
 * @param {string} content - The file content
 * @param {RegExp} pattern - Regex pattern to match imports
 * @param {Set<string>} imports - Set to store extracted imports
 */
function extractImportsWithPattern(content, pattern, imports) {
    const matches = content.match(pattern) || []
    matches.forEach(importStr => {
        try {
            const importMatch = importStr.match(/['"]([^'"]+)['"]/)
            if (importMatch && importMatch[1]) {
                imports.add(importMatch[1])
            }
        } catch (err) {
            // Continue with other imports if there's an error
            console.warn(`Warning: Could not extract import path: ${importStr}`)
        }
    })
}

/**
 * Extracts template literal imports from a content string
 * @private
 * @param {string} content - The file content
 * @param {Set<string>} imports - Set to store extracted imports
 */
function extractTemplateLiteralImports(content, imports) {
    const templateLiteralImports = content.match(/import\s*\(\s*`[^`]+`\s*\)/g) || []
    templateLiteralImports.forEach(importStr => {
        try {
            // Extract the template literal content
            const templateContent = importStr.match(/`([^`]+)`/)[1]
            // Only process if it seems like a local path (not an external package)
            if (templateContent && !templateContent.startsWith('@') && 
                !templateContent.includes('node_modules')) {
                
                // Handle simple template literals (no interpolation)
                if (!templateContent.includes('${')) {
                    imports.add(templateContent)
                } else {
                    // For complex interpolated literals, extract all possible paths
                    // First, if we have something before the first interpolation
                    const staticParts = templateContent.split(/\${[^}]+}/)
                    if (staticParts.length > 0 && staticParts[0]) {
                        // Get the directory path before the first variable
                        const pathBeforeVar = staticParts[0]
                        const dirPath = pathBeforeVar.includes('/') ? 
                            path.dirname(pathBeforeVar) : 
                            pathBeforeVar
                        
                        if (dirPath && dirPath !== '.') {
                            imports.add(dirPath)
                        }
                        
                        // For cases like `./pages/${name}/index`, we want to capture ./pages too
                        const segments = pathBeforeVar.split('/')
                        if (segments.length > 1) {
                            let cumulativePath = segments[0]
                            for (let i = 1; i < segments.length; i++) {
                                cumulativePath = `${cumulativePath}/${segments[i]}`
                                if (segments[i] && !segments[i].includes('$')) {
                                    imports.add(cumulativePath)
                                }
                            }
                        }
                    }
                    
                    // Extract potential full paths by replacing interpolations with sample values
                    const simulatedPath = templateContent.replace(/\${[^}]+}/g, 'placeholder')
                    if (simulatedPath && simulatedPath !== templateContent) {
                        imports.add(simulatedPath)
                    }
                }
            }
        } catch (err) {
            // Continue with other imports if there's an error processing this one
            console.warn(`Warning: Could not process template literal import: ${importStr}`)
        }
    })
}

/**
 * Extracts all import paths from JavaScript/TypeScript code content
 * @param {string} content - The code content to analyze
 * @param {Object} options - Options for import extraction
 * @param {boolean} [options.includeNodeModules=false] - Whether to include node_modules imports
 * @param {boolean} [options.includeExternalPackages=false] - Whether to include external package imports
 * @returns {string[]} Array of import paths found in the content
 */
function extractImportsFromContent(content, options = {}) {
    const { 
        includeNodeModules = false, 
        includeExternalPackages = false 
    } = options
    
    const imports = new Set()
    
    // Define all the regex patterns for different import types
    const patterns = {
        // Standard ES module imports
        esModuleImports: /import.*from\s+['"]([^'"]+)['"]/g,
        
        // CommonJS requires
        commonJsRequires: /require\(['"]([^'"]+)['"]\)/g,
        
        // Side effect imports
        sideEffectImports: /import\s+['"]([^'"]+)['"]/g,
        
        // Re-exports
        reExports: /export.*from\s+['"]([^'"]+)['"]/g,
        
        // Dynamic imports
        dynamicImports: /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        
        // React.lazy imports - with React namespace
        reactLazyImports: /React\.lazy\s*\(\s*(?:[\w$]+\s*=>\s*)?import\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)/g,
        
        // React.lazy imports - with destructured import
        destructuredLazyImports: /lazy\s*\(\s*(?:[\w$]+\s*=>\s*)?import\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)/g,
        
        // Non-arrow function React.lazy
        functionLazyImports: /lazy\s*\(\s*function\s*\(\s*\)\s*\{\s*return\s*import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    }
    
    // Apply each pattern to extract imports
    Object.values(patterns).forEach(pattern => {
        extractImportsWithPattern(content, pattern, imports)
    })
    
    // Handle template literal imports separately
    extractTemplateLiteralImports(content, imports)
    
    // Filter imports based on options
    return Array.from(imports).filter(importPath => {
        if (!includeNodeModules && importPath.includes('node_modules')) {
            return false
        }
        
        const isExternalPackage = !includeExternalPackages && (
            (importPath.startsWith('@') && !importPath.includes('/')) ||
            (!importPath.includes('/') && !importPath.includes('.')) ||
            importPath.startsWith('http')
        )
        
        return !isExternalPackage
    })
}

module.exports = {
    extractImportsFromContent
} 