const tableGenerators = require('./TableGenerators')
const handlebars = require('handlebars')

// Define Handlebars template
const indexPageTemplate = handlebars.compile(`
{{generateCompactNavigation '' 'index.md'}}
# Components

## Dashboard

| **Summary Stats** | **Value** |
|:---------------------|:------------:|
| **Components Analyzed** | **{{componentCount}}** |
| **Files Affected** | **{{fileCount}}** |
| **Usage Instances** | **{{usageCount}}** |
| **Features** | **{{featureCount}}** |
| **Hubs** | **{{hubCount}}** |

## Available Reports

| Report | Description |
|--------|-------------|
| [Component Analysis](components.md) | Detailed component usage statistics and distribution |
| [Features Overview](features.md) | Features and their component integration points |
| [Hubs Overview](hubs.md) | Hub components and their dependency relationships |

## About This Report

This component usage analysis provides insights into how components are used across your codebase.
Use these reports to understand component distribution, dependencies, and usage patterns.

### How to Use These Reports

1. Start with the **Component Analysis** to understand your component landscape and identify high-impact components
2. Explore **Features** to see how components are combined to create features
3. Examine **Hubs** to understand component integration and dependency points

> **Note:** All reports include navigation to help you move between related information.
`)

/**
 * Calculate stats based on the detailed report
 * @param {Object} detailedReport - The detailed component analysis report
 * @returns {Object} The calculated statistics
 */
const calculateStats = (detailedReport) => {
    const stats = {
        totalComponents: 0,
        totalUsages: 0,
        totalFiles: 0,
        averageUsage: 0,
        packageDistribution: {},
        featureLevelDistribution: {
            'High': 0,
            'Medium': 0,
            'Low': 0,
            'Very Low': 0
        }
    }
    
    if (!detailedReport) return stats
    
    stats.totalComponents = detailedReport.components?.length || 0
    stats.totalFiles = detailedReport.files?.length || 0
    
    // Calculate total usages and package distribution
    if (detailedReport.components) {
        // Total usages
        stats.totalUsages = detailedReport.components.reduce(
            (sum, comp) => sum + (comp.totalUsages || 0), 
            0
        )
        
        // Calculate average
        if (stats.totalComponents > 0) {
            stats.averageUsage = stats.totalUsages / stats.totalComponents
        }
        
        // Calculate package distribution
        detailedReport.components.forEach(comp => {
            if (!stats.packageDistribution[comp.package]) {
                stats.packageDistribution[comp.package] = 0
            }
            stats.packageDistribution[comp.package]++
            
            // Calculate feature level distribution
            const featureLevel = tableGenerators.getComponentFeatureLevel(comp)
            if (stats.featureLevelDistribution[featureLevel] !== undefined) {
                stats.featureLevelDistribution[featureLevel]++
            }
        })
    }
    
    return stats
}

/**
 * Generates the main index landing page
 * @param {Object} config - Configuration for the reporter
 * @param {Object} params - Parameters object
 * @param {Object} params.detailedReport - The detailed component analysis report
 * @param {Object} params.intersectionsReport - The intersection report data (optional)
 * @returns {string} The markdown content
 */
const generateIndexPage =  ({config, detailedReport, intersectionsReport}) => {
    try {
        // Set up config
        const repoUrl = config?.repoUrl || ''
        if (!repoUrl) {
            console.warn('No repository URL provided. File links will be disabled.')
        }

        // Calculate basic stats for the dashboard
        const stats = calculateStats(detailedReport)
        const componentCount = detailedReport.components?.length || 0
        const fileCount = detailedReport.files?.length || 0
        const usageCount = stats.totalUsages || 0
        
        let hubCount = 0
        let featureCount = 0
        
        if (intersectionsReport) {
            const { hubCategories, globalImportHubByIntersection } = intersectionsReport
            
            // Count hubs if available
            if (hubCategories) {
                const { mainHubs = [], intermediateHubs = [], baseHubs = [] } = hubCategories
                hubCount = mainHubs.length + intermediateHubs.length + baseHubs.length
            }
            
            // Count features if available
            if (globalImportHubByIntersection) {
                featureCount = Object.keys(globalImportHubByIntersection).length
            }
        }
        
        // Create template data object
        const templateData = {
            componentCount,
            fileCount,
            usageCount,
            hubCount,
            featureCount
        }
        
        // Render the template with the data
        return indexPageTemplate(templateData)
    } catch (error) {
        console.error(`Error generating index page: ${error.stack}`)
        return '# Error Generating Index\n\nFailed to generate the index page.'
    }
}


module.exports = {generateIndexPage}