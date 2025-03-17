/**
 * Utility functions for generating markdown tables in reports
 */
const utils = require('./ReportUtils')

/**
 * Generates a table of key component files sorted by component usage
 * @param {Object} detailedReport - The detailed report data
 * @param {string} repoUrl - Repository URL for file links
 * @returns {string} Markdown table of key component files
 */
const generateKeyComponentFiles = (detailedReport, repoUrl) => {
    if (!detailedReport || !detailedReport.files || detailedReport.files.length === 0) {
        return 'No key component files identified.'
    }

    try {
        // Get files with most component usages
        const keyComponentFiles = [...detailedReport.files]
            .sort((a, b) => {
                const aComponentCount = a.componentsUsed?.length || 0
                const bComponentCount = b.componentsUsed?.length || 0
                return bComponentCount - aComponentCount
            })

        const tableLines = [
            '| File | Components | Props Used | Components |',
            '|------|------------|------------|-------------------|'
        ]

        keyComponentFiles.forEach(file => {
            const componentCount = file.componentsUsed?.length || 0
            
            // Count total props used across all components in this file
            let totalPropsUsed = 0
            let componentsUsed = []
            
            if (file.componentsUsed) {
                // Count props
                totalPropsUsed = file.componentsUsed.reduce((sum, comp) => {
                    return sum + (comp.props ? comp.props.length : 0)
                }, 0)
                
                // Get top components by usage
                componentsUsed = file.componentsUsed
                    .map(comp => utils.createMarkdownLink(comp.name, `./components/${utils.sanitizePackageName(comp.package)}/${utils.createSafeAnchor(comp.name)}.md`))
                    .join(', ')
                    
            }
            
  
            
            tableLines.push(
                `| ${utils.createFileLink(file.path, repoUrl)} | ${componentCount} | ${totalPropsUsed} |  ${componentsUsed} |`
            )
        })

        return tableLines.join('\n')
    } catch (error) {
        console.error(`Error generating key component files table: ${error.message}`)
        return 'Error generating key component files table.'
    }
}

/**
 * Generates a table showing components grouped by feature level
 * @param {Object} detailedReport - The detailed report data
 * @param {Function} getComponentFeatureLevel - Function to determine component feature level
 * @returns {string} Markdown table of components by feature level
 */
const generateFeatureLevelTable = (detailedReport, getComponentFeatureLevel) => {
    if (!detailedReport || !detailedReport.components || detailedReport.components.length === 0) {
        return 'No component feature level data available.'
    }

    try {
        // Group components by feature level
        const featureLevelGroups = {
            'High': [],
            'Medium': [],
            'Low': [],
            'Very Low': []
        }
        
        detailedReport.components.forEach(comp => {
            const featureLevel = getComponentFeatureLevel(comp)
            if (featureLevelGroups[featureLevel]) {
                featureLevelGroups[featureLevel].push(comp)
            }
        })
        
        const sections = []
        
        // Create tables for each feature level group
        Object.entries(featureLevelGroups).forEach(([featureLevel, components]) => {
            if (components.length === 0) return
            
            // Create collapsible section using GitHub-compatible details/summary tags
            sections.push('<details>')
            
            // Add emoji indicators for feature levels
            let featureLevelWithEmoji = featureLevel
            if (featureLevel === 'High') featureLevelWithEmoji = '🔴 High'
            else if (featureLevel === 'Medium') featureLevelWithEmoji = '🟠 Medium'
            else if (featureLevel === 'Low') featureLevelWithEmoji = '🟡 Low'
            else if (featureLevel === 'Very Low') featureLevelWithEmoji = '🟢 Very Low'
            
            sections.push(`<summary><b>${featureLevelWithEmoji} Feature Intensity (${components.length} components)</b></summary>`)
            sections.push('')
            sections.push('| Component | Package | Usage Count | Files | Props | Variants | Impact Score |')
            sections.push('|-----------|---------|-------------|-------|-------|----------|-------------|')
            
            // Sort by impact within each category
            const sortedComps = [...components].sort((a, b) => 
                (b.totalUsages || 0) - (a.totalUsages || 0)
            )
            
            sortedComps.forEach(comp => {
                const propCount = comp.props?.unique?.length || 0
                const name = utils.createSafeAnchor(comp.name)
                const packageName = comp.package || 'unknown-package'
                const sanitizedPackage = utils.sanitizePackageName(packageName)
                
                // Calculate impact score
                const impactScore = calculateImpactScore(comp)
                
                // Add prop set diversity data
                const propSetCount = comp.propSetsByComponent?.length || 0
                
                sections.push(
                    `| [${comp.name}](./components/${sanitizedPackage}/${name}.md) ` +
                    `| ${comp.package} ` +
                    `| ${comp.totalUsages || 0} ` +
                    `| ${comp.fileCount || 0} ` +
                    `| ${propCount} ` +
                    `| ${propSetCount} ` +
                    `| ${impactScore.toFixed(1)} |`
                )
            })
            
            sections.push('')
            sections.push('</details>')
            sections.push('')
        })

        return sections.join('\n')
    } catch (error) {
        console.error(`Error generating feature level table: ${error.message}`)
        return 'Error generating feature level table.'
    }
}

/**
 * Calculate an impact score for a component based on usage, prop complexity, and prop set diversity
 * Higher score means more impact and versatility in the codebase
 * @param {Object} component - The component data
 * @returns {number} Impact score from 0-10
 */
const calculateImpactScore = (component) => {
    const usageWeight = 0.4     // Weight for usage count in overall score
    const propWeight = 0.2      // Weight for prop complexity in overall score
    const diversityWeight = 0.4 // Weight for prop set diversity in overall score
    
    // Normalize usage count (0-10 scale)
    const usageCount = component.totalUsages || 0
    let usageScore = 0
    if (usageCount >= 100) usageScore = 10
    else if (usageCount > 0) usageScore = Math.min(10, Math.log10(usageCount) * 5)
    
    // Normalize prop count (0-10 scale)
    const propCount = component.props?.unique?.length || 0
    let propScore = 0
    if (propCount >= 20) propScore = 10
    else if (propCount > 0) propScore = Math.min(10, propCount / 2)
    
    // Calculate prop set diversity score (0-10 scale)
    const propSetCount = component.propSetsByComponent?.length || 0
    let diversityScore = 0
    if (propSetCount >= 20) diversityScore = 10
    else if (propSetCount > 0) diversityScore = Math.min(10, propSetCount / 2)
    
    // Calculate weighted score
    return (usageScore * usageWeight) + (propScore * propWeight) + (diversityScore * diversityWeight)
}

/**
 * Generates a table showing components grouped by package
 * @param {Object} detailedReport - The detailed report data
 * @param {Function} getComponentFeatureLevel - Function to determine component feature level
 * @returns {string} Markdown table of components by package
 */
const generatePackageTable = (detailedReport, getComponentFeatureLevel) => {
    if (!detailedReport || !detailedReport.components || detailedReport.components.length === 0) {
        return 'No component package data available.'
    }

    try {
        // Group components by package
        const packageGroups = {}
        
        detailedReport.components.forEach(comp => {
            const packageName = comp.package || 'unknown-package'
            
            if (!packageGroups[packageName]) {
                packageGroups[packageName] = []
            }
            
            packageGroups[packageName].push(comp)
        })
        
        const sections = []
        
        // Create tables for each package, starting with those with the most components
        Object.entries(packageGroups)
            .sort((a, b) => b[1].length - a[1].length)
            .forEach(([packageName, components]) => {
                // Create collapsible section using GitHub-compatible details/summary tags
                sections.push('<details>')
                sections.push(`<summary><b>${packageName} (${components.length} components)</b></summary>`)
                sections.push('')
                sections.push('| Component | Usage Count | Files | Props | Feature Level |')
                sections.push('|-----------|-------------|-------|-------|--------------|')
                
                // Sort by usage count within each package
                const sortedComps = [...components].sort((a, b) => 
                    (b.totalUsages || 0) - (a.totalUsages || 0)
                )
                
                sortedComps.forEach(comp => {
                    const propCount = comp.props?.unique?.length || 0
                    const name = utils.createSafeAnchor(comp.name)
                    const featureLevel = getComponentFeatureLevel(comp)
                    const sanitizedPackage = utils.sanitizePackageName(packageName)
                    
                    // Format feature level with emoji indicators
                    let featureLevelFormatted = featureLevel
                    if (featureLevel === 'High') featureLevelFormatted = '🔴 High'
                    else if (featureLevel === 'Medium') featureLevelFormatted = '🟠 Medium'
                    else if (featureLevel === 'Low') featureLevelFormatted = '🟡 Low'
                    else if (featureLevel === 'Very Low') featureLevelFormatted = '🟢 Very Low'
                    
                    sections.push(
                        `| [${comp.name}](./components/${sanitizedPackage}/${name}.md) | ` +
                        `${comp.totalUsages || 0} | ${comp.fileCount || 0} | ${propCount} | ${featureLevelFormatted} |`
                    )
                })
                
                sections.push('')
                sections.push('</details>')
                sections.push('')
            })

        return sections.join('\n')
    } catch (error) {
        console.error(`Error generating package table: ${error.message}`)
        return 'Error generating package table.'
    }
}

/**
 * Generates a table showing components by usage frequency
 * @param {Object} detailedReport - The detailed report data
 * @returns {string} Markdown table of components by usage frequency
 */
const generateUsageFrequencyTable = (detailedReport) => {
    if (!detailedReport || !detailedReport.components || detailedReport.components.length === 0) {
        return 'No component usage data available.'
    }

    try {
        // Group components by usage frequency
        const usageGroups = {
            'Very High (50+)': [],
            'High (20-49)': [],
            'Medium (10-19)': [],
            'Low (5-9)': [],
            'Very Low (1-4)': []
        }
        
        detailedReport.components.forEach(comp => {
            const usageCount = comp.totalUsages || 0
            
            if (usageCount >= 50) {
                usageGroups['Very High (50+)'].push(comp)
            } else if (usageCount >= 20) {
                usageGroups['High (20-49)'].push(comp)
            } else if (usageCount >= 10) {
                usageGroups['Medium (10-19)'].push(comp)
            } else if (usageCount >= 5) {
                usageGroups['Low (5-9)'].push(comp)
            } else {
                usageGroups['Very Low (1-4)'].push(comp)
            }
        })
        
        const sections = []
        
        // Create tables for each usage group, in order of frequency
        const groupOrder = ['Very High (50+)', 'High (20-49)', 'Medium (10-19)', 'Low (5-9)', 'Very Low (1-4)']
        
        groupOrder.forEach(groupName => {
            const components = usageGroups[groupName]
            if (components.length === 0) return
            
            // Create collapsible section using GitHub-compatible details/summary tags
            sections.push('<details>')
            sections.push(`<summary><b>${groupName} Usage (${components.length} components)</b></summary>`)
            sections.push('')
            sections.push('| Component | Package | Usage Count | Files | Props |')
            sections.push('|-----------|---------|-------------|-------|-------|')
            
            // Sort by usage count within each group
            const sortedComps = [...components].sort((a, b) => 
                (b.totalUsages || 0) - (a.totalUsages || 0)
            )
            
            sortedComps.forEach(comp => {
                const propCount = comp.props?.unique?.length || 0
                const name = utils.createSafeAnchor(comp.name)
                const packageName = comp.package || 'unknown-package'
                
                sections.push(
                    `| [${comp.name}](./components/${utils.sanitizePackageName(packageName)}/${name}.md) | ${comp.package} | ` +
                    `${comp.totalUsages || 0} | ${comp.fileCount || 0} | ${propCount} |`
                )
            })
            
            sections.push('')
            sections.push('</details>')
            sections.push('')
        })

        return sections.join('\n')
    } catch (error) {
        console.error(`Error generating usage frequency table: ${error.message}`)
        return 'Error generating usage frequency table.'
    }
}

/**
 * Generates a table of components with critical props usage
 * @param {Object} detailedReport - The detailed report data
 * @returns {string} Markdown table of components with critical props
 */
const generateCriticalPropsTable = (detailedReport) => {
    if (!detailedReport || !detailedReport.components || detailedReport.components.length === 0) {
        return 'No critical props data available.'
    }

    try {
        // Get components with critical props (styling, behavior, etc.)
        const criticalPropCategories = ['styling', 'behavior', 'accessibility', 'data']
        const componentsWithCriticalProps = detailedReport.components.filter(comp => {
            if (!comp.props || !comp.props.byCategory) return false
            
            // Check if component has props in any critical category
            return criticalPropCategories.some(category => 
                comp.props.byCategory[category] && comp.props.byCategory[category].length > 0
            )
        })
        
        // Sort by the total number of critical props
        const sortedComponents = [...componentsWithCriticalProps].sort((a, b) => {
            const aCriticalProps = criticalPropCategories.reduce((sum, category) => 
                sum + (a.props.byCategory[category]?.length || 0), 0)
                
            const bCriticalProps = criticalPropCategories.reduce((sum, category) => 
                sum + (b.props.byCategory[category]?.length || 0), 0)
                
            return bCriticalProps - aCriticalProps
        })
        
        if (sortedComponents.length === 0) {
            return 'No components with critical props identified.'
        }
        
        const tableLines = [
            '| Component | Package | Styling | Behavior | Accessibility | Data |',
            '|-----------|---------|---------|----------|---------------|------|'
        ]
        
        sortedComponents.forEach(comp => {
            const name = utils.createSafeAnchor(comp.name)
            const packageName = comp.package || 'unknown-package'
            
            // Count props in each critical category
            const stylingProps = comp.props.byCategory.styling?.length || 0
            const behaviorProps = comp.props.byCategory.behavior?.length || 0
            const accessibilityProps = comp.props.byCategory.accessibility?.length || 0
            const dataProps = comp.props.byCategory.data?.length || 0
            
            // Highlight high counts with bold
            const stylingDisplay = stylingProps > 5 ? `**${stylingProps}**` : stylingProps
            const behaviorDisplay = behaviorProps > 5 ? `**${behaviorProps}**` : behaviorProps
            const accessibilityDisplay = accessibilityProps > 3 ? `**${accessibilityProps}**` : accessibilityProps
            const dataDisplay = dataProps > 5 ? `**${dataProps}**` : dataProps
            
            tableLines.push(
                `| [${comp.name}](./components/${utils.sanitizePackageName(packageName)}/${name}.md) | ${comp.package} | ` +
                `${stylingDisplay} | ${behaviorDisplay} | ${accessibilityDisplay} | ${dataDisplay} |`
            )
        })

        return tableLines.join('\n')
    } catch (error) {
        console.error(`Error generating critical props table: ${error.message}`)
        return 'Error generating critical props table.'
    }
}

/**
 * Generates a table of components with special props usage
 * @param {Object} detailedReport - The detailed report data
 * @param {Function} hasSpecificProp - Function to check if a component has a specific prop
 * @returns {string} Markdown table of components with special props
 */
const generateSpecialPropsTable = (detailedReport, hasSpecificProp) => {
    if (!detailedReport || !detailedReport.components || detailedReport.components.length === 0) {
        return 'No special props data available.'
    }

    try {
        // Special props to check for across components
        const specialProps = {
            'className': 'Styling override',
            'style': 'Inline styling',
            'onClick': 'Click handler',
            'data-testid': 'Test identifier',
            'aria-*': 'Accessibility',
            'ref': 'DOM reference',
            'key': 'React list key',
            'children': 'Child content'
        }
        
        // Get components that use any of the special props
        const componentsWithSpecialProps = detailedReport.components.filter(comp => {
            return Object.keys(specialProps).some(propName => hasSpecificProp(comp, propName))
        })
        
        if (componentsWithSpecialProps.length === 0) {
            return 'No components with special props identified.'
        }
        
        const tableLines = [
            '| Component | Package | className | style | onClick | data-testid | aria-* | ref | key | children |',
            '|-----------|---------|-----------|-------|---------|-------------|--------|-----|-----|----------|'
        ]
        
        // Sort by number of special props used
        const sortedComponents = [...componentsWithSpecialProps].sort((a, b) => {
            const aSpecialProps = Object.keys(specialProps).filter(prop => hasSpecificProp(a, prop)).length
            const bSpecialProps = Object.keys(specialProps).filter(prop => hasSpecificProp(b, prop)).length
            return bSpecialProps - aSpecialProps
        })
        
        sortedComponents.forEach(comp => {
            const name = utils.createSafeAnchor(comp.name)
            const packageName = comp.package || 'unknown-package'
            
            // Check for each special prop
            const cells = Object.keys(specialProps).map(propName => {
                return hasSpecificProp(comp, propName) ? '✅' : '-'
            })
            
            tableLines.push(
                `| [${comp.name}](./components/${utils.sanitizePackageName(packageName)}/${name}.md) | ${comp.package} | ` +
                cells.join(' | ') + ' |'
            )
        })

        return tableLines.join('\n')
    } catch (error) {
        console.error(`Error generating special props table: ${error.message}`)
        return 'Error generating special props table.'
    }
}

/**
 * Helper function to calculate component density for a file
 * @param {string} filePath - The file path
 * @param {Array} files - Array of files from detailed report
 * @returns {string} Component density description
 */
const calculateComponentDensity = (filePath, files) => {
    // Find file in the files array
    const file = files.find(f => f.path === filePath)
    if (!file) return 'Unknown'
    
    const componentCount = file.componentsUsed?.length || 0
    const lineCount = file.lineCount || 1 // Avoid division by zero
    
    const ratio = componentCount / lineCount
    
    // Classify density based on components per line of code
    if (ratio >= 0.1) return 'Very High'
    if (ratio >= 0.05) return 'High'
    if (ratio >= 0.02) return 'Medium'
    if (ratio > 0) return 'Low'
    return 'None'
}

/**
 * Helper function to determine component feature level based on usage patterns
 * @param {Object} component - Component data
 * @returns {string} Feature level (High, Medium, Low, Very Low)
 */
const getComponentFeatureLevel = (component) => {
    // Calculate a score based on usage patterns
    let score = 0
    
    // Usage count contributes to feature level
    const usageCount = component.totalUsages || 0
    score += usageCount * 1.5
    
    // Diversity of props used
    const propCount = component.props?.unique?.length || 0
    score += propCount * 2
    
    // Spread across files
    const fileCount = component.fileCount || 0
    score += fileCount * 3
    
    // NEW: Prop set diversity (different ways the component is configured)
    const propSetCount = component.propSetsByComponent?.length || 0
    score += propSetCount * 5  // Weight this heavily as it shows true component versatility
    
    // NEW: Calculate a usage standardization factor
    // If the component is used in multiple files with the same prop set, it indicates
    // a more standardized usage pattern
    let standardizationFactor = 1
    if (component.propSetsByComponent && component.propSetsByComponent.length > 0) {
        // Find the most common prop set usage
        const mostCommonPropSetUsage = component.propSetsByComponent.reduce(
            (max, propSet) => Math.max(max, propSet.files.length),
            0
        )
        
        // Calculate what percentage of total usage is the most common pattern
        const standardizationPercentage = mostCommonPropSetUsage / (usageCount || 1)
        
        // Adjust score based on standardization - highly standardized components
        // get a slight boost as they represent established patterns
        if (standardizationPercentage > 0.7) {
            standardizationFactor = 1.1 // Small boost for standardized components
        }
    }
    
    // Apply the standardization factor
    score = score * standardizationFactor
    
    // Debug info when needed during development
    // console.log(`Component: ${component.name}, Score: ${score}, UsageCount: ${usageCount}, PropCount: ${propCount}, FileCount: ${fileCount}, PropSetCount: ${propSetCount}`)
    
    // Determine feature level based on final score
    if (score >= 100) return 'High'
    if (score >= 50) return 'Medium'
    if (score >= 20) return 'Low'
    return 'Very Low'
}

/**
 * Helper function to check if a component has a specific prop or prop pattern
 * @param {Object} component - Component data
 * @param {string} propName - Prop name or pattern to check for
 * @returns {boolean} True if component has the prop
 */
const hasSpecificProp = (component, propName) => {
    if (!component.props || !component.props.unique) return false
    
    // For exact matches
    if (propName.indexOf('*') === -1) {
        return component.props.unique.includes(propName)
    }
    
    // For wildcard patterns like 'aria-*'
    const pattern = propName.replace('*', '')
    return component.props.unique.some(prop => prop.startsWith(pattern))
}

module.exports = {
    generateKeyComponentFiles,
    generateFeatureLevelTable,
    generatePackageTable,
    generateUsageFrequencyTable,
    generateCriticalPropsTable,
    generateSpecialPropsTable,
    calculateComponentDensity,
    getComponentFeatureLevel,
    hasSpecificProp,
    calculateImpactScore
} 