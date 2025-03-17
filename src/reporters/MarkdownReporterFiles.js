const handlebars = require('handlebars')

/**
 * Calculate file impact based on component count
 */
const calculateFileImpact = (filePath, files) => {
    if (!filePath || !files || !files.length) return 'Unknown'

    // Find the file in the analysis
    const file = files.find(f => f.path === filePath)
    if (!file) return 'Low'
    
    // Check how many components are used in this file
    const componentCount = file.componentsUsed?.length || 0
    
    // Assess impact based on component count
    if (componentCount >= 10) {
        return 'Very High'
    } else if (componentCount >= 5) {
        return 'High'
    } else if (componentCount >= 2) {
        return 'Medium'
    } else if (componentCount >= 1) {
        return 'Low'
    } else {
        return 'Very Low'
    }
}

/**
 * Calculate hub score for a file based on intersections data
 */
const calculateHubScore = (filePath, intersectionsReport) => {
    if (!filePath || !intersectionsReport) return 0
    
    // Check if file is a global import hub
    const isGlobalHub = intersectionsReport.globalImportHubs?.some(hub => hub.path === filePath)
    let hubScore = isGlobalHub ? 3 : 0
    
    // Check hub usage (how many components use this file)
    const hubUsage = intersectionsReport.hubUsage?.[filePath]
    if (hubUsage && hubUsage.usedBy) {
        hubScore += hubUsage.usedBy.length
    }
    
    // Check if file is in any hub category
    const categories = intersectionsReport.hubCategories
    if (categories) {
        if (categories.baseHubs?.some(hub => hub.path === filePath)) hubScore += 2
        if (categories.mainHubs?.some(hub => hub.path === filePath)) hubScore += 1
        if (categories.intermediateHubs?.some(hub => hub.path === filePath)) hubScore += 3
    }
    
    return hubScore
}

/**
 * Get intersection points for a file
 */
const getIntersectionPoints = (filePath, intersectionsReport) => {
    if (!filePath || !intersectionsReport) return 0
    
    // Check if file is an intersection importer
    const isIntersection = intersectionsReport.intersectionImporters?.some(
        importer => importer.path === filePath
    )
    
    // Check if file is used by intersections
    let usedByIntersections = 0
    intersectionsReport.globalImportHubs?.forEach(hub => {
        if (hub.path === filePath) {
            usedByIntersections = hub.usedByIntersectionsCount || 0
        }
    })
    
    return isIntersection ? usedByIntersections + 1 : usedByIntersections
}

/**
 * Get direct and indirect importers for a file from dependency report
 */
const getImportersInfo = (filePath, dependencyReport) => {
    const result = {
        directImporters: 0,
        indirectImporters: 0
    }
    
    if (!filePath || !dependencyReport) return result
    
    // Iterate through all packages in dependency report
    Object.keys(dependencyReport).forEach(packageName => {
        const packageFiles = dependencyReport[packageName]?.files || {}
        
        // Check if file exists in this package
        if (packageFiles[filePath]) {
            result.directImporters = packageFiles[filePath].directImporters?.length || 0
            result.indirectImporters = packageFiles[filePath].indirectImporters?.length || 0
        }
    })
    
    return result
}

/**
 * Calculate risk level based on various metrics
 */
const calculateRiskLevel = (componentCount, directImporters, indirectImporters, hubScore, intersectionPoints) => {
    const total = componentCount + directImporters + indirectImporters + hubScore + intersectionPoints
    
    if (total >= 15 || hubScore >= 5 || intersectionPoints >= 3) {
        return 'High'
    } else if (total >= 8 || hubScore >= 3 || intersectionPoints >= 1) {
        return 'Medium'
    } else {
        return 'Low'
    }
}

/**
 * Calculate complexity based on various metrics
 */
const calculateComplexity = (componentCount, directImporters, indirectImporters, hubScore, intersectionPoints) => {
    // Weighted calculation for complexity
    const complexityScore = 
        (componentCount * 1) + 
        (directImporters * 1.5) + 
        (indirectImporters * 0.8) + 
        (hubScore * 2) + 
        (intersectionPoints * 3)
    
    if (complexityScore >= 20) {
        return 'High'
    } else if (complexityScore >= 10) {
        return 'Medium'
    } else {
        return 'Low'
    }
}

/**
 * Get component prop complexity metrics
 */
const getPropsComplexityMetrics = (filePath, detailedReport) => {
    const result = {
        uniquePropsCount: 0,
        propsComplexity: 'Low'
    }
    
    if (!filePath || !detailedReport || !detailedReport.files) return result
    
    const fileInfo = detailedReport.files.find(f => f.path === filePath)
    if (!fileInfo || !fileInfo.componentsUsed) return result
    
    // Count total unique props across all components in the file
    const allProps = fileInfo.componentsUsed.flatMap(c => c.props || [])
    const uniqueProps = [...new Set(allProps)]
    result.uniquePropsCount = uniqueProps.length
    
    // Calculate props complexity
    if (result.uniquePropsCount >= 15) {
        result.propsComplexity = 'High'
    } else if (result.uniquePropsCount >= 7) {
        result.propsComplexity = 'Medium'
    } else {
        result.propsComplexity = 'Low'
    }
    
    return result
}

/**
 * Calculate dependency depth for a file
 */
const calculateDependencyDepth = (filePath, dependencyReport) => {
    let maxDepth = 0
    
    if (!filePath || !dependencyReport) return maxDepth
    
    // Helper function to find maximum path length in a dependency chain
    const findMaxDepth = (startFile, visited = new Set(), currentDepth = 0) => {
        if (visited.has(startFile)) return currentDepth // Avoid circular dependencies
        
        visited.add(startFile)
        let maxChildDepth = currentDepth
        
        // Check all packages for importers
        Object.keys(dependencyReport).forEach(packageName => {
            const packageFiles = dependencyReport[packageName]?.files || {}
            const fileInfo = packageFiles[startFile]
            
            if (fileInfo && fileInfo.directImporters) {
                fileInfo.directImporters.forEach(importer => {
                    const depth = findMaxDepth(importer, new Set(visited), currentDepth + 1)
                    maxChildDepth = Math.max(maxChildDepth, depth)
                })
            }
        })
        
        return maxChildDepth
    }
    
    maxDepth = findMaxDepth(filePath)
    return maxDepth
}

/**
 * Generate visual indicator for risk level
 */
const getRiskIndicator = (riskLevel) => {
    switch(riskLevel) {
    case 'High': return '🔴'
    case 'Medium': return '🟠'
    case 'Low': return '🟢'
    default: return '⚪'
    }
}

/**
 * Generate visual indicator for complexity
 */
const getComplexityIndicator = (complexity) => {
    switch(complexity) {
    case 'High': return '🔶'
    case 'Medium': return '🔹'
    case 'Low': return '✅'
    default: return '⚪'
    }
}

/**
 * Find potential circular dependencies
 */
const findCircularDependencies = (processedFiles, dependencyReport) => {
    const circularDeps = new Set()
    
    // Only perform analysis if we have sufficient files and dependency data
    if (!processedFiles || !dependencyReport) return { 
        hasCircular: false, 
        circularFiles: [] 
    }
    
    // Helper function to detect circular paths
    const detectCircular = (startFile, currentPath = [], visited = new Set()) => {
        if (visited.has(startFile)) {
            // Found circular dependency
            const circleStart = currentPath.indexOf(startFile)
            const circularPath = currentPath.slice(circleStart)
            circularPath.forEach(file => circularDeps.add(file))
            return true
        }
        
        visited.add(startFile)
        currentPath.push(startFile)
        
        // Check all packages
        Object.keys(dependencyReport).forEach(packageName => {
            const packageFiles = dependencyReport[packageName]?.files || {}
            const fileInfo = packageFiles[startFile]
            
            if (fileInfo && fileInfo.directImporters) {
                fileInfo.directImporters.forEach(importer => {
                    detectCircular(importer, [...currentPath], new Set(visited))
                })
            }
        })
        
        return false
    }
    
    // Check each file for circular dependencies
    processedFiles.forEach(file => {
        detectCircular(file.path)
    })
    
    return { 
        hasCircular: circularDeps.size > 0, 
        circularFiles: Array.from(circularDeps) 
    }
}

// Extended template for impact files report
const impactFilesTemplate = `
{{generateCompactNavigation '' 'files.md'}}

## Components by File

{{#if sortInfo}}
_Sorted by: {{sortInfo}}_
{{/if}}

<details>
<summary>💡 How to Use This Report (click to expand)</summary>

### Understanding This Report

This report helps you identify which files in your codebase have the highest impact when making changes:

- **Risk** indicates overall change impact (🔴 High, 🟠 Medium, 🟢 Low)
- **Impact** shows how extensively the file uses components
- **Direct Importers** shows how many files directly depend on this file
- **Props Count** indicates complexity in terms of component API usage
- **Dependency Depth** shows how deeply changes might propagate

Higher scores generally mean more care is needed when modifying these files.

</details>

| Risk | File | Components | Impact | Direct Importers | Props Count | Dependency Depth |
|------|------|-----------|--------|------------------|------------|-----------------|
{{#each files}}
| {{riskIndicator}} | {{createFileLink path ../config.repoUrl}} | {{componentsCount}} | {{impact}} | {{directImporters}} | {{uniquePropsCount}} | {{dependencyDepth}} |
{{/each}}

### Summary
- **High Risk Files**: {{highRiskCount}} ({{highRiskPercentage}}%)
- **Medium Risk Files**: {{mediumRiskCount}} ({{mediumRiskPercentage}}%)
- **Low Risk Files**: {{lowRiskCount}} ({{lowRiskPercentage}}%)

### Key Insights
- **Most Connected Files**: {{#each mostConnectedFiles}}{{createFileLink path ../config.repoUrl}} ({{totalConnections}} connections){{#unless @last}}, {{/unless}}{{/each}}
- **Highest Props Complexity**: {{#each highestPropsFiles}}{{createFileLink path ../config.repoUrl}} ({{uniquePropsCount}} props){{#unless @last}}, {{/unless}}{{/each}}
- **Deepest Dependency Files**: {{#each deepestDependencyFiles}}{{createFileLink path ../config.repoUrl}} (depth {{dependencyDepth}}){{#unless @last}}, {{/unless}}{{/each}}

{{#if hasCircularDependencies}}
### ⚠️ Circular Dependencies Detected
The following files are involved in circular dependency chains:
{{#each circularDependencies}}
- {{createFileLink this ../config.repoUrl}}
{{/each}}
{{/if}}
`

const generateImpactFiles = ({dependencyReport, detailedReport, intersectionsReport, config}) => {
    if (!detailedReport || !detailedReport.files || detailedReport.files.length === 0) {
        return 'No component usage data identified.'
    }
    
    // Process files with extended metrics
    const processedFiles = detailedReport.files.map(file => {
        const componentsCount = file.componentsUsed?.length || 0
        const importersInfo = getImportersInfo(file.path, dependencyReport)
        const hubScore = calculateHubScore(file.path, intersectionsReport)
        const intersectionPoints = getIntersectionPoints(file.path, intersectionsReport)
        const propsInfo = getPropsComplexityMetrics(file.path, detailedReport)
        const dependencyDepth = calculateDependencyDepth(file.path, dependencyReport)
        
        const riskLevel = calculateRiskLevel(
            componentsCount, 
            importersInfo.directImporters, 
            importersInfo.indirectImporters,
            hubScore,
            intersectionPoints
        )
        
        const complexity = calculateComplexity(
            componentsCount,
            importersInfo.directImporters,
            importersInfo.indirectImporters,
            hubScore,
            intersectionPoints
        )
        
        // Calculate total connections for sorting
        const totalConnections = importersInfo.directImporters + 
                                importersInfo.indirectImporters + 
                                intersectionPoints

        return {
            path: file.path,
            componentsCount,
            impact: calculateFileImpact(file.path, detailedReport.files),
            directImporters: importersInfo.directImporters,
            indirectImporters: importersInfo.indirectImporters,
            hubScore,
            intersectionPoints,
            uniquePropsCount: propsInfo.uniquePropsCount,
            propsComplexity: propsInfo.propsComplexity,
            dependencyDepth,
            riskLevel,
            complexity,
            totalConnections,
            // Pre-compute the indicators
            riskIndicator: getRiskIndicator(riskLevel),
            complexityIndicator: getComplexityIndicator(complexity)
        }
    })

    // Sort by risk level and component count (high to low)
    const sortedFiles = [...processedFiles].sort((a, b) => {
        // Primary sort by risk level
        const riskOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
        const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
        if (riskDiff !== 0) return riskDiff
        
        // Secondary sort by component count
        return b.componentsCount - a.componentsCount
    })

    // Calculate summary statistics
    const totalFiles = sortedFiles.length
    const highRiskCount = sortedFiles.filter(f => f.riskLevel === 'High').length
    const mediumRiskCount = sortedFiles.filter(f => f.riskLevel === 'Medium').length
    const lowRiskCount = sortedFiles.filter(f => f.riskLevel === 'Low').length
    
    const highRiskPercentage = Math.round((highRiskCount / totalFiles) * 100) || 0
    const mediumRiskPercentage = Math.round((mediumRiskCount / totalFiles) * 100) || 0
    const lowRiskPercentage = Math.round((lowRiskCount / totalFiles) * 100) || 0
    
    // Find most connected files (top 3)
    const mostConnectedFiles = [...sortedFiles]
        .sort((a, b) => b.totalConnections - a.totalConnections)
        .slice(0, 3)
    
    // Find files with highest props complexity (top 3)
    const highestPropsFiles = [...sortedFiles]
        .sort((a, b) => b.uniquePropsCount - a.uniquePropsCount)
        .slice(0, 3)
    
    // Find files with deepest dependency chains (top 3)
    const deepestDependencyFiles = [...sortedFiles]
        .sort((a, b) => b.dependencyDepth - a.dependencyDepth)
        .slice(0, 3)
        
    // Detect circular dependencies
    const circularDepsInfo = findCircularDependencies(sortedFiles, dependencyReport)

    // Compile and render the template
    const template = handlebars.compile(impactFilesTemplate)
    return template({ 
        files: sortedFiles,
        config,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        highRiskPercentage,
        mediumRiskPercentage,
        lowRiskPercentage,
        mostConnectedFiles,
        highestPropsFiles,
        deepestDependencyFiles,
        hasCircularDependencies: circularDepsInfo.hasCircular,
        circularDependencies: circularDepsInfo.circularFiles,
        sortInfo: 'Risk Level and Component Count'
    })
}

module.exports = {generateImpactFiles} 