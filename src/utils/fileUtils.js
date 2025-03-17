const path = require('path')
const fs = require('fs')

/**
 * Normalizes an import path, resolving aliases and relatives
 */
function normalizePath(importPath, currentFile, aliasMap = {}) {
    // First try to resolve aliases
    const lowerImport = importPath.toLowerCase()
    for (const [alias, target] of Object.entries(aliasMap)) {
        const lowerAlias = alias.toLowerCase()
        if (lowerImport.startsWith(lowerAlias)) {
            return target + importPath.slice(alias.length)
        }
    }

    // Remove extension if exists
    importPath = importPath.replace(/\.(js|jsx|ts|tsx)$/, '')
    // Remove trailing /index
    importPath = importPath.replace(/\/index$/, '')
    
    let resolvedPath
    if (importPath === '.') {
        // Handle "import './'" case
        resolvedPath = path.dirname(currentFile)
    } else if (importPath.startsWith('.')) {
        // Handle relative imports
        resolvedPath = path.join(path.dirname(currentFile), importPath)
    } else if (!importPath.startsWith('src/')) {
        // Handle absolute imports from project root
        resolvedPath = `src/${importPath}`
    } else {
        resolvedPath = importPath
    }
    
    // Convert to forward slashes and ensure no double slashes
    return resolvedPath.replace(/\\/g, '/').replace(/\/+/g, '/')
}

/**
 * Finds the actual file on disk matching a normalized path
 */
function findActualFile(basePath) {
    const extensions = ['.js', '.jsx', '.ts', '.tsx']
    const variants = [
        // Direct file with extensions
        ...extensions.map(ext => basePath + ext),
        // Index files in directory
        ...extensions.map(ext => path.join(basePath, 'index' + ext)),
        // The path itself (if it's a directory with index file)
        basePath,
        // The path with /index
        basePath + '/index'
    ]
    
    for (const variant of variants) {
        const normalizedVariant = variant.replace(/\\/g, '/').replace(/\/+/g, '/')
        if (fs.existsSync(normalizedVariant)) {
            return path.relative(process.cwd(), normalizedVariant).replace(/\\/g, '/')
        }
    }
    return null
}

/**
 * Recursively removes a directory and its contents
 */
function rimrafSync(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((entry) => {
            const entryPath = path.join(dirPath, entry)
            if (fs.lstatSync(entryPath).isDirectory()) {
                rimrafSync(entryPath)
            } else {
                fs.unlinkSync(entryPath)
            }
        })
        
        // Only try to remove directory if it's not the main output dir
        if (path.basename(dirPath) !== 'output') {
            try {
                fs.rmdirSync(dirPath)
            } catch (e) {
                console.warn(`Could not remove directory ${dirPath}: ${e.message}`)
            }
        }
    }
}

/**
 * Ensures a directory exists, cleaning it if specified
 */
function ensureDirectory(dir, clean = false) {
    if (fs.existsSync(dir)) {
        if (clean) {
            // Clear existing files but keep the directory
            const entries = fs.readdirSync(dir)
            entries.forEach((entry) => {
                const entryPath = path.join(dir, entry)
                if (fs.lstatSync(entryPath).isDirectory()) {
                    rimrafSync(entryPath)
                } else {
                    fs.unlinkSync(entryPath)
                }
            })
        }
    } else {
        fs.mkdirSync(dir, { recursive: true })
    }
    return dir
}

module.exports = {
    normalizePath,
    findActualFile,
    rimrafSync,
    ensureDirectory
} 