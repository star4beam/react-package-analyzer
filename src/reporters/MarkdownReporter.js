const fs = require('fs')
const utils = require('./ReportUtils')
const logger = require('../utils/logger')
const path = require('path')
const MainNavigation = require('./MainNavigation')  // Add import for MainNavigation
const MarkdownReporterComponentsAnalysis = require('./MarkdownReporterComponentsAnalysis')
const MarkdownReporterComponentFile = require('./MarkdownReporterComponentFile')
const MarkdownReporterHubOverviewReport = require('./MarkdownReporterHubOverviewReport')
const MarkdownReporterFeatureFile = require('./MarkdownReporterFeatureFile')
const MarkdownReporterIndex = require('./MarkdownReporterIndex')
const MarkdownReporterHubFile = require('./MarkdownReporterHubFile')
const MarkdownReporterFeatures = require('./MarkdownReporterFeatures')
const MarkdownReporterFiles = require('./MarkdownReporterFiles')
const Handlebars = require('handlebars')

// Format helpers
Handlebars.registerHelper('formatCategoryName', function(category) {
    return utils.formatCategoryName(category)
})

// Navigation helpers
Handlebars.registerHelper('generateMainNavigation', function(basePath = '') {
    return MainNavigation.generateMainNavigation(basePath)
})

Handlebars.registerHelper('generateCompactNavigation', function(basePath = '', currentPage = '') {
    return MainNavigation.generateCompactNavigation(basePath, currentPage)
})

// Link and formatting helpers
Handlebars.registerHelper('createSafeAnchor', function(text) {
    return utils.createSafeAnchor(text)
})

Handlebars.registerHelper('createMarkdownLink', function(text, url) {
    return utils.createMarkdownLink(text, url)
})

Handlebars.registerHelper('createFileLink', function(filePath, repoUrl) {
    return utils.createFileLink(filePath, repoUrl)
})

// String manipulation helpers
Handlebars.registerHelper('concat', function() {
    return Array.prototype.slice.call(arguments, 0, -1).join('')
})

/**
 * Creates the directory structure needed for reports
 * @param {string} outputDir - The output directory
 * @private
 */
const createDirectoryStructure = (outputDir) => {
    const directories = [
        { name: 'components', path: path.join(outputDir, 'components') },
        { name: 'features', path: path.join(outputDir, 'features') },
        { name: 'hubs', path: path.join(outputDir, 'hubs') }
    ]
    
    directories.forEach(({ name, path: dirPath }) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true })
            
            logDirectoryCreation(name, dirPath, logger)
        }
    })
}

/**
 * Checks if the intersections report has the necessary data
 * @param {Object} intersectionsReport - The intersections report
 * @returns {boolean} Whether necessary intersection data exists
 * @private
 */
const hasIntersectionData = (intersectionsReport) => {
    return intersectionsReport && intersectionsReport.globalImportHubByIntersection
}

/**
 * Checks if the detailed report has component data
 * @param {Object} detailedReport - The detailed report
 * @returns {boolean} Whether component data exists
 * @private
 */
const hasComponentData = (detailedReport) => {
    return detailedReport.components && detailedReport.components.length > 0
}

/**
 * Writes a report to a file
 * @param {string} outputDir - The output directory
 * @param {string} filename - The filename to write to
 * @param {string} content - The content to write
 * @returns {Promise<void>}
 */
const writeReport = async (outputDir, filename, content) => {
    try {
        const reportPath = path.join(outputDir, filename)
        await fs.promises.writeFile(reportPath, content)
    } catch (error) {
        console.error(`Error writing markdown report ${filename}: ${error.stack}`)
        throw error
    }
}

/**
 * Calculates an impact score for a component based on its usage metrics
 * @param {Object} component - The component to calculate the score for
 * @returns {number} The calculated impact score
 */
const calculateImpactScore = (component) => {
    if (!component) return 0
    
    // Calculate raw scores based on component metrics (cap each at 100)
    const usageScore = Math.min(100, (component.totalUsages || 0) * 2)
    const fileScore = Math.min(100, (component.fileCount || 0) * 4)
    const propScore = Math.min(100, ((component.props?.unique?.length || 0) * 5))
    
    // Check for special props which increase component complexity
    const specialProps = ['className', 'style', 'ref', 'children']
    let specialPropScore = 0
    let specialPropsUsed = []
    
    if (component.props && component.props.unique) {
        specialPropScore = specialProps.reduce((score, prop) => {
            if (component.props.unique.includes(prop)) {
                specialPropsUsed.push(prop)
                return score + 15
            }
            return score
        }, 0)
    }
    
    // Weight the scores based on importance for usage impact analysis
    const weightedScore = (
        (usageScore * 0.4) +  // 40% weight for usage frequency
        (fileScore * 0.3) +   // 30% weight for file distribution
        (propScore * 0.2) +   // 20% weight for prop complexity
        (specialPropScore * 0.1)  // 10% weight for special props
    )
    
    return Math.round(weightedScore)
}

/**
 * Groups components by their impact level
 * @param {Array} components - The components to group
 * @returns {Object} Components grouped by impact level
 * @private
 */
const groupComponentsByImpactLevel = (components) => {
    return {
        high: components.filter(c => c.impactScore >= 35),
        medium: components.filter(c => c.impactScore >= 15 && c.impactScore < 35),
        low: components.filter(c => c.impactScore < 15)
    }
}

/**
 * Adds a section for components of a specific impact level
 * @param {Array} sections - The sections array to add to
 * @param {Array} components - The components in this impact level
 * @param {string} title - The section title
 * @param {string} description - The section description
 * @private
 */
const addImpactLevelSection = (sections, components, title, description) => {
    if (components.length > 0) {
        sections.push(`### ${title}`)
        sections.push('')
        sections.push(description)
        sections.push('')
        
        components.forEach(comp => {
            const safeName = utils.createSafeAnchor(comp.name)
            sections.push(`- [${comp.name}](./${safeName}.md) - Impact Score: ${comp.impactScore}, Usage: ${comp.totalUsages || 0} in ${comp.fileCount || 0} files`)
        })
        
        sections.push('')
    }
}

/**
 * Generates an index file for a package
 * @param {string} packageName - The name of the package
 * @param {Array} components - The components in the package
 * @returns {string} The generated markdown content
 */
const generatePackageIndex = (packageName, components) => {
    // Sort components by impact score
    const sortedComponents = [...components].sort((a, b) => b.impactScore - a.impactScore)
    
    const sections = [
        `# ${packageName} Components`,
        '',
        // Add navigation with proper relative path
        MainNavigation.generateCompactNavigation('../../', 'component'),
        '',
        `This index lists all components from the \`${packageName}\` package, sorted by usage impact.`,
        '',
        '## Components by Impact',
        '',
    ]
    
    // Group components by impact level
    const impactLevels = groupComponentsByImpactLevel(sortedComponents)
    
    // Add high impact components section
    addImpactLevelSection(
        sections, 
        impactLevels.high, 
        'High Impact Components', 
        'These components have the highest usage impact in your codebase:'
    )
    
    // Add medium impact components section
    addImpactLevelSection(
        sections, 
        impactLevels.medium, 
        'Medium Impact Components', 
        'These components have moderate usage across your application:'
    )
    
    // Add low impact components section
    addImpactLevelSection(
        sections, 
        impactLevels.low, 
        'Low Impact Components', 
        'These components have limited usage in your codebase:'
    )
    
    return sections.join('\n')
}

/**
 * Groups components by their package
 * @param {Array} components - The components to group
 * @returns {Object} Components grouped by package name
 * @private
 */
const groupComponentsByPackage = (components) => {
    const componentsByPackage = {}
    
    for (const component of components) {
        const packageName = component.package || 'unknown-package'
        if (!componentsByPackage[packageName]) {
            componentsByPackage[packageName] = []
        }
        componentsByPackage[packageName].push({
            ...component,
            impactScore: calculateImpactScore(component)
        })
    }
    
    return componentsByPackage
}

/**
 * Generates individual component files for a package
 * @param {Object} config - The configuration object
 * @param {string} packageName - The name of the package
 * @param {Array} components - The components in the package
 * @param {Object} detailedReport - The detailed report
 * @param {string} packageDir - The package directory path
 * @private
 */
const generateComponentFilesForPackage = async (config, packageName, components, detailedReport, packageDir) => {
    for (const component of components) {
        try {
            const componentContent = MarkdownReporterComponentFile.generateComponentFile({
                config, 
                component, 
                detailedReport, 
                packageName
            })
            
            const safeFileName = utils.createSafeAnchor(component.name)
            const filePath = path.join(packageDir, `${safeFileName}.md`)
            await fs.promises.writeFile(filePath, componentContent)
            console.log(`Generated component file: ${utils.sanitizePackageName(packageName)}/${safeFileName}.md`)
        } catch (error) {
            console.error(`Error generating component file for ${component.name}: ${error.message}`)
        }
    }
}

/**
 * Generates the package index file
 * @param {string} packageName - The name of the package
 * @param {Array} components - The components in the package
 * @param {string} packageDir - The package directory path
 * @private
 */
const generatePackageIndexFile = async (packageName, components, packageDir) => {
    try {
        const packageIndexContent = generatePackageIndex(packageName, components)
        const indexPath = path.join(packageDir, 'index.md')
        await fs.promises.writeFile(indexPath, packageIndexContent)
        console.log(`Generated package index: ${utils.sanitizePackageName(packageName)}/index.md`)
    } catch (error) {
        console.error(`Error generating package index for ${packageName}: ${error.message}`)
    }
}

/**
 * Generates all reports for a specific package
 * @param {Object} config - The configuration object
 * @param {string} outputDir - The output directory
 * @param {string} packageName - The name of the package
 * @param {Array} components - The components in the package
 * @param {Object} detailedReport - The detailed report
 * @private
 */
const generatePackageReports = async (config, outputDir, packageName, components, detailedReport) => {
    try {
        // Create package directory
        const packageDir = path.join(outputDir, 'components', utils.sanitizePackageName(packageName))
        if (!fs.existsSync(packageDir)) {
            fs.mkdirSync(packageDir, { recursive: true })
            console.log()
            console.log(`Created package directory: ${packageDir}`)
        }
        
        // Generate component files for this package
        await generateComponentFilesForPackage(config, packageName, components, detailedReport, packageDir)
        
        // Generate package index file
        await generatePackageIndexFile(packageName, components, packageDir)

      
    } catch (error) {
        console.error(`Error generating reports for package ${packageName}: ${error.message}`)
    }
}

/**
 * Generates all component-related reports
 * @param {Object} config - The configuration object
 * @param {string} outputDir - The output directory
 * @param {Object} detailedReport - The detailed report
 * @private
 */
const generateComponentReports = async (config, outputDir, detailedReport) => {
    console.log(`Generating ${detailedReport.components.length} component files...`)
    
    // Group components by package
    const componentsByPackage = groupComponentsByPackage(detailedReport.components)
    
    // Generate component files for each package
    for (const packageName in componentsByPackage) {
        await generatePackageReports(config, outputDir, packageName, componentsByPackage[packageName], detailedReport)
    }
}

/**
 * Generates the hubs overview report
 * @param {Object} config - The configuration object
 * @param {string} outputDir - The output directory 
 * @param {string} repoUrl - The repository URL
 * @param {Object} intersectionsReport - The intersections report
 * @private
 */
const generateHubsOverviewReport = async (config, outputDir, repoUrl, intersectionsReport) => {
    const hubsOverviewReport = MarkdownReporterHubOverviewReport.generateHubsOverviewReport(intersectionsReport)
    await writeReport(outputDir, 'hubs.md', hubsOverviewReport)
    console.log('Successfully generated hubs.md')
}

/**
 * Generates all hub-related reports
 * @param {Object} config - The configuration object
 * @param {string} outputDir - The output directory
 * @param {string} repoUrl - The repository URL
 * @param {Object} intersectionsReport - The intersections report
 * @param {Object} detailedReport - The detailed report
 * @private
 */
const generateHubReports = async (config, outputDir, repoUrl, intersectionsReport, detailedReport) => {
    // Generate individual hub files
    for (const hubPath of Object.keys(intersectionsReport.globalImportHubs)) {
        const hub = intersectionsReport.globalImportHubs[hubPath]
        const hubReport = MarkdownReporterHubFile.generateHubFile({hub, intersectionsReport, detailedReport, config})
        
        // Create safe filename from hub name
        const safeName = utils.createSafeAnchor(hub.name)
        await writeReport(outputDir, `hubs/${safeName}.md`, hubReport)
    }
    console.log('Successfully generated hub files')
    
    // Generate hubs overview report if dependency data exists
    if (intersectionsReport.hubDependencies && intersectionsReport.hubUsage) {
        await generateHubsOverviewReport(config, outputDir, repoUrl, intersectionsReport)
    }
}

/**
 * Generates individual markdown files for each feature
 * @param {Object} config - The configuration object
 * @param {string} outputDir - The output directory
 * @param {Object} intersectionsReport - The intersections report data
 * @param {Object} detailedReport - The detailed component analysis report
 */
const generateIndividualFeatureFiles = async (config, outputDir, intersectionsReport, detailedReport) => {
    try {
        const { globalImportHubByIntersection, hubCategories } = intersectionsReport
        
        // Create a set of all hub paths to filter them out from features
        const allHubPaths = new Set([
            ...(hubCategories.baseHubs || []).map(hub => hub.path),
            ...(hubCategories.mainHubs || []).map(hub => hub.path),
            ...(hubCategories.intermediateHubs || []).map(hub => hub.path)
        ])
        
        // Sort features alphabetically by name and filter out any hubs
        const features = Object.entries(globalImportHubByIntersection)
            .map(([path, data]) => ({ path, ...data }))
            .filter(feature => !allHubPaths.has(feature.path))
            .sort((a, b) => a.name.localeCompare(b.name))
        
        for (const feature of features) {
            const fileContent = MarkdownReporterFeatureFile.generateFeatureFile({
                config, 
                feature, 
                intersectionsReport, 
                detailedReport
            })
            
            // Create safe filename from feature name
            const safeName = utils.createSafeAnchor(feature.name)
            await writeReport(outputDir, `features/${safeName}.md`, fileContent)
            console.log(`Generated feature file: features/${safeName}.md`)
        }
    } catch (error) {
        console.error(`Error generating individual feature files: ${error.stack}`)
        throw error
    }
}

/**
 * Generates all feature-related reports
 * @param {Object} config - The configuration object
 * @param {string} outputDir - The output directory
 * @param {string} repoUrl - The repository URL
 * @param {Object} intersectionsReport - The intersections report
 * @param {Object} detailedReport - The detailed report
 * @private
 */
const generateFeatureReports = async (config, outputDir, repoUrl, intersectionsReport, detailedReport) => {
    // Generate features overview report
    const featuresReport = MarkdownReporterFeatures.generateFeaturesReport(intersectionsReport)
    await writeReport(outputDir, 'features.md', featuresReport)
    console.log('Successfully generated features.md')
    
    // Generate individual feature files
    await generateIndividualFeatureFiles(config, outputDir, intersectionsReport, detailedReport)
    console.log('Successfully generated individual feature files')
    
    // Generate hub reports if hub data exists
    if (intersectionsReport.globalImportHubs) {
        await generateHubReports(config, outputDir, repoUrl, intersectionsReport, detailedReport)
    }
}

/**
 * Generates the main index and component analysis reports
 * @param {Object} config - The configuration object
 * @param {string} outputDir - The output directory
 * @param {Object} detailedReport - The detailed report
 * @param {Object} intersectionsReport - The intersections report
 * @private
 */
const generateMainReports = async (config, outputDir, detailedReport, intersectionsReport) => {
    // Generate index page
    const indexPage = MarkdownReporterIndex.generateIndexPage({
        config, 
        detailedReport, 
        intersectionsReport
    })
    await writeReport(outputDir, 'index.md', indexPage)
    console.log('Successfully generated index.md')
    
    // Generate main component analysis report
    const report = MarkdownReporterComponentsAnalysis.generateMainReport({
        config, 
        detailedReport
    })
    await writeReport(outputDir, 'components.md', report)
    console.log('Successfully generated components.md')
}

/**
 * Main entry point for generating all markdown reports
 * @param {Object} config - The configuration object
 * @param {Object} param1 - Object containing detailed and intersections reports
 * @param {Object} param1.detailedReport - The detailed component analysis report
 * @param {Object} param1.intersectionsReport - The intersections report data
 * @returns {Promise<Object>} Result of the report generation
 */
const generateMarkdownReport = async ({config, detailedReport, intersectionsReport, dependencyReport}) => {
    try {
        const outputDir = config.outputDir
        const repoUrl = config.repoUrl || ''
        
        if (!repoUrl) {
            console.warn('No repository URL provided. File links will be disabled.')
        }
        
        createDirectoryStructure(outputDir)
        
        await generateMainReports(config, outputDir, detailedReport, intersectionsReport)
        
        if (hasIntersectionData(intersectionsReport)) {
            await generateFeatureReports(config, outputDir, repoUrl, intersectionsReport, detailedReport)
        }
        
        if (hasComponentData(detailedReport)) {
            await generateComponentReports(config, outputDir, detailedReport)
            const filesReport = await MarkdownReporterFiles.generateImpactFiles({detailedReport, intersectionsReport,dependencyReport, config})
            await writeReport(outputDir, 'files.md', filesReport)
            console.log('Successfully generated files.md')
       
        } else {
            console.log('No components found to generate component files')
        }

        
        return { success: true, message: 'Markdown report generated successfully' }
    } catch (error) {
        console.error(`Error generating markdown report: ${error.stack}`)
        throw error
    }
}

/**
 * Reads and parses a JSON report file from the specified directory
 * @param {string} outputDir - The directory containing the report files
 * @param {string} filename - The name of the JSON report file to read
 * @returns {Promise<Object>} - The parsed JSON content
 */
async function readJsonReport(outputDir, filename) {
    try {
        const dataDir = path.join(outputDir, 'data')
        const filePath = path.join(dataDir, filename)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(fileContent)
    } catch (error) {
        console.error(`Error reading JSON report ${filename}: ${error.message}`)
        process.exit(1)
    }
}

// The issue is appearing in multiple places when generating component files
// Let's define a helper function to standardize the fix:

function logDirectoryCreation(name, dirPath, logger) {
    // If logger exists and is sophisticated, use it properly
    if (logger && typeof logger.info === 'function') {
        console.log() // Add newline
        logger.info(`Created ${name} directory: ${dirPath}`)
    } else {
    // Otherwise use console.log with newline
        console.log() 
        console.log(`Created ${name} directory: ${dirPath}`)
    }
}

module.exports = {
    generateMarkdownReport,
    readJsonReport,
} 