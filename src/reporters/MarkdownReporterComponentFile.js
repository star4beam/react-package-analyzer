const utils = require('./ReportUtils')
const handlebars = require('handlebars')

const getImpactLevel = (score) => {
    if (score >= 80) return 'High'
    if (score >= 40) return 'Medium'
    return 'Low'
}

const explainImpactScore = (score) => {
    const level = getImpactLevel(score)
    
    if (level === 'High') {
        return 'This component has high impact in your codebase. It\'s widely used across multiple files and/or has a complex prop interface. Changes to this component would affect many parts of your application.'
    } else if (level === 'Medium') {
        return 'This component has medium impact in your codebase. It\'s used in several files and has moderate complexity. Changes should be made with care.'
    } else {
        return 'This component has relatively low impact in your codebase. It\'s used in fewer files or has a simpler interface. Changes are less likely to cause widespread issues.'
    }
}

const calculateImpactScore = (component) => {
    if (!component) return 0
    
    // Calculate raw scores based on component metrics (cap each at 100)
    const usageScore = Math.min(100, (component.totalUsages || 0) * 2)
    const fileScore = Math.min(100, (component.fileCount || 0) * 4)
    const propScore = Math.min(100, ((component.props?.unique?.length || 0) * 5))
    
    // Check for special props which increase component complexity
    let specialPropScore = 0
    let specialPropsUsed = []
    if (component.props && component.props.unique) {
        const specialProps = ['className', 'style', 'ref', 'children']
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
 * Determines the impact level of a prop category
 * @param {string} category - The prop category name
 * @returns {{level: 'high'|'medium'|'low', description: string}} The impact level and description
 */
const getCategoryUsageImpact = (category) => {
    const highImpactCategories = ['eventHandler', 'stateControl', 'behavior']
    const lowImpactCategories = ['testSelector', 'dataAttributes']
    
    // Return impact level based on category type
    if (highImpactCategories.includes(category)) {
        return { 
            level: 'high', 
            description: 'Category with significant impact on component behavior and usage patterns.'
        }
    } else if (lowImpactCategories.includes(category)) {
        return { 
            level: 'low', 
            description: 'Category with minimal impact on core component behavior.'
        }
    } else {
        return { 
            level: 'medium', 
            description: 'Category that affects component usage patterns.'
        }
    }
}

const getComponentFeatureLevel = (component) => {
    if (!component) return 'Medium'
    
    // Simple check based on number of props and usage count
    const propCount = component.props?.unique?.length || 0
    const usageCount = component.totalUsages || 0
    
    if (propCount > 10 || usageCount > 50) {
        return 'High'
    } else if (propCount > 5 || usageCount > 20) {
        return 'Medium'
    } else if (propCount > 2 || usageCount > 5) {
        return 'Low'
    } else {
        return 'Very Low'
    }
}

const findPropCategory = (component, propName) => {
    // Special case for children prop - always categorize as composition
    if (propName === 'children') {
        return 'composition'
    }
    
    if (!component.props?.categories) {
        return null
    }
    
    for (const [category, data] of Object.entries(component.props.categories)) {
        if (data.props && data.props[propName]) {
            return category
        }
    }
    
    return null
}

const findRelatedComponents = (component, detailedReport) => {
    const related = []
    
    if (!component.files || component.files.length === 0 || !detailedReport.components) {
        return related
    }
    
    // Track components that appear in the same files
    const coOccurrences = {}
    
    // For each file where this component is used
    component.files.forEach(file => {
        // Find file data
        const fileData = detailedReport.files?.find(f => f.path === file)
        if (!fileData || !fileData.componentsUsed) return
        
        // For each component used in this file
        fileData.componentsUsed.forEach(comp => {
            // Skip the current component
            if (comp.name === component.name) return
            
            // Initialize or increment the co-occurrence count
            if (!coOccurrences[comp.name]) {
                coOccurrences[comp.name] = {
                    name: comp.name,
                    package: comp.package || 'unknown',
                    commonFiles: 0,
                    files: []
                }
            }
            
            coOccurrences[comp.name].commonFiles++
            coOccurrences[comp.name].files.push(file)
        })
    })
    
    // Convert to array and sort by co-occurrence count
    const relatedComponents = Object.values(coOccurrences)
        .sort((a, b) => b.commonFiles - a.commonFiles)
        .slice(0, 5) // Get top 5 related components
    
    // Add relationship description
    relatedComponents.forEach(rel => {
        if (rel.commonFiles > component.files.length * 0.8) {
            rel.relationship = 'Often used together'
        } else if (rel.commonFiles > component.files.length * 0.5) {
            rel.relationship = 'Frequently used together'
        } else if (rel.commonFiles > component.files.length * 0.3) {
            rel.relationship = 'Related API calls'
        } else {
            rel.relationship = 'Sometimes used together'
        }
    })
    
    return relatedComponents
}

/**
 * Calculates the Jaccard similarity between two prop sets
 * @param {string[]} setA - First prop set
 * @param {string[]} setB - Second prop set
 * @returns {number} Similarity index (0-1)
 */
const calculatePropSetSimilarity = (setA, setB) => {
    if (!setA || !setB || setA.length === 0 || setB.length === 0) return 0
    
    // Create sets for faster intersection calculation
    const a = new Set(setA)
    const b = new Set(setB)
    
    // Calculate intersection size
    const intersection = new Set([...a].filter(prop => b.has(prop)))
    
    // Calculate union size
    const union = new Set([...a, ...b])
    
    // Jaccard similarity index: |A ∩ B| / |A ∪ B|
    return intersection.size / union.size
}

/**
 * Groups prop sets by similarity
 * @param {Array} propSets - Array of prop set objects
 * @param {number} similarityThreshold - Threshold for considering two sets similar (0-1)
 * @returns {Array} Array of grouped prop sets
 */
const groupSimilarPropSets = (propSets, similarityThreshold = 0.75) => {
    if (!propSets || propSets.length === 0) return []
    
    // Clone prop sets to avoid modifying the original
    const propSetsCopy = JSON.parse(JSON.stringify(propSets))
    
    // Initialize groups
    const groups = []
    
    // Process prop sets
    while (propSetsCopy.length > 0) {
        // Take the first prop set as the basis for a new group
        const baseSet = propSetsCopy.shift()
        const currentGroup = {
            base: baseSet,
            similar: [],
            totalUsage: baseSet.files.length,
            allProps: new Set(baseSet.propSet)
        }
        
        // Find similar prop sets
        for (let i = propSetsCopy.length - 1; i >= 0; i--) {
            const similarity = calculatePropSetSimilarity(
                baseSet.propSet, 
                propSetsCopy[i].propSet
            )
            
            if (similarity >= similarityThreshold) {
                const similarSet = propSetsCopy.splice(i, 1)[0]
                currentGroup.similar.push({
                    ...similarSet,
                    similarity: similarity.toFixed(2)
                })
                currentGroup.totalUsage += similarSet.files.length
                
                // Add all props to the set of all props in this group
                similarSet.propSet.forEach(prop => currentGroup.allProps.add(prop))
            }
        }
        
        // Convert allProps back to an array
        currentGroup.allProps = Array.from(currentGroup.allProps)
        
        // Add group to groups
        groups.push(currentGroup)
    }
    
    // Sort groups by total usage
    return groups.sort((a, b) => b.totalUsage - a.totalUsage)
}

// Define Handlebars templates with proper escaping
const componentFileTemplate = handlebars.compile(`
{{generateCompactNavigation '../../' 'component'}}

# {{component.name}} ({{component.package}})

## Component Facts

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Component | {{component.name}} | Package | {{component.package}} |
| Usage Count | {{usageCount}} instances | Files | {{fileCount}} files |
| Unique Props | {{uniquePropCount}} props | Prop Categories | {{categoryCount}} categories |
| Impact Score | {{impactScore}} ({{impactLevel}}) | | |

### Impact Assessment

**{{impactLevel}} Impact Component**  
Primary factor: {{primaryImpactFactor}}

{{impactScoreExplanation}}

## Prop Usage Analysis

### Props by Category and Usage

| Category | Props | Usage Count |
|----------|-------|-------------|
{{#each sortedCategories}}
| {{categoryDisplay}} | {{#each topPropsWithCount}}{{{prop}}} ({{count}}){{#unless @last}}, {{/unless}}{{/each}} | {{data.count}} |
{{/each}}

{{#if hasPropSets}}
## Prop Combinations

This section analyzes similar ways this component is configured across the codebase ({{similarityThreshold}}% similarity threshold).

{{#if hasSimilarPropSets}}
{{#each similarPropGroups}}
### Pattern Group {{groupNumber}} ({{totalUsage}} total usages)

**Base configuration**: {{{baseProps}}}

{{#if similar.length}}
**Variations**:
{{#each similar}}
- {{{props}}} ({{fileCount}} uses, {{similarity}} similarity)
{{/each}}
{{/if}}

{{/each}}
{{else}}
### Common Configurations

| Prop Combination | Usage Count | % of Total Uses |
|------------------|-------------|----------------|
{{#each propSets}}
| {{{props}}} | {{fileCount}} | {{usagePercentage}}% |
{{/each}}

> **Flexibility Index: {{flexibilityIndex}}%** - This measures how many different ways the component is configured relative to its total usage. Higher numbers indicate more versatility.
{{/if}}
{{/if}}

## Locations

### Component Usage Map

| File | Props Used | Prop Categories |
|------|------------|----------------|
{{#each fileUsageData}}
| {{{fileLink}}} | {{{propsDisplay}}} | {{totalCategories}} |
{{/each}}

{{#if hasRelatedComponents}}
### Co-located Components
Components that appear in the same files:

| Component | Package | Common Files |
|-----------|---------|--------------|
{{#each relatedComponents}}
| {{{componentLink}}} | {{package}} | {{commonFiles}} |
{{/each}}
{{/if}}
`)

// Generate component file with the new structure using Handlebars
const generateComponentFile = ({ component, detailedReport, packageName, config }) => {
    try {
        const { repoUrl = '' } = config || {}
        const impactScore = calculateImpactScore(component)
        const relatedComponents = findRelatedComponents(component, detailedReport)
        
        // Organize data by categories (if available)
        const categories = {}
        let totalPropCount = 0
        
        // Basic component statistics
        const categoryCount = Object.keys(component.props?.categories || {}).length
        const usageCount = component.totalUsages || 0
        const fileCount = component.fileCount || 0
        const uniquePropCount = component.props?.unique?.length || 0
        
        if (component.props?.categories) {
            // Count props by category
            Object.entries(component.props.categories).forEach(([category, data]) => {
                const allProps = Object.entries(data.props || {})
                    .sort((a, b) => b[1] - a[1]) // Sort by usage count
                    .map(([prop, count]) => ({ prop, count }))
                    
                categories[category] = {
                    count: data.count || 0,
                    props: allProps,
                    impact: getCategoryUsageImpact(category),
                    percentage: 0 // Will calculate after we have totalPropCount
                }
                
                totalPropCount += data.count || 0
            })
            
            // Calculate percentage for each category
            Object.values(categories).forEach(cat => {
                cat.percentage = totalPropCount > 0 ? Math.round((cat.count / totalPropCount) * 100) : 0
            })
        }
        
        // Collect file usage data for the matrix
        const fileUsageData = []
        const categoryUsageCount = {}
        const categoriesList = Object.keys(categories)
        
        // Initialize category usage count
        categoriesList.forEach(cat => {
            categoryUsageCount[cat] = 0
        })
        
        // Build file usage data
        if (component.files) {
            component.files.forEach(file => {
                // Find file data
                const fileData = detailedReport.files?.find(f => f.path === file)
                if (!fileData) return
                
                // Find component usage in this file
                const componentUsage = fileData.componentsUsed?.find(c => c.name === component.name)
                if (!componentUsage) return
                
                // Get props used in this file
                const props = componentUsage.props || []
                const propNames = props.map(p => typeof p === 'string' ? p : p.name)
                
                // Skip files with no props
                if (propNames.length === 0) return
                
                // Get categories for the props
                const propCategories = {}
                let totalCategoriesUsed = 0
                
                propNames.forEach(prop => {
                    const category = findPropCategory(component, prop)
                    if (category) {
                        propCategories[category] = propCategories[category] || []
                        propCategories[category].push(prop)
                        if (propCategories[category].length === 1) {
                            totalCategoriesUsed++
                            categoryUsageCount[category]++
                        }
                    }
                })
                
                // Add file to the list with categories used
                fileUsageData.push({
                    file,
                    usageCount: componentUsage.usageCount || 1,
                    props: propNames,
                    categories: propCategories,
                    totalCategories: totalCategoriesUsed
                })
            })
        }
        
        // Get high impact categories
        const highImpactCategories = Object.entries(categories)
            .filter(([_, data]) => data.impact.level === 'high')
            .map(([cat, _]) => cat)
            
        // Sort categories by count
        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([cat, data]) => {
                const formattedCategory = utils.formatCategoryName(cat)
                const isHighImpact = highImpactCategories.includes(cat)
                
                // Format category name - bold for high impact
                const categoryDisplay = isHighImpact ? `**${formattedCategory}**` : formattedCategory
                
                // Get top props with counts (all props in this category)
                const topPropsWithCount = data.props.map(p => ({
                    prop: isHighImpact ? `**${p.prop}**` : `\`${p.prop}\``,
                    count: p.count
                }))
                
                return {
                    category: cat,
                    data,
                    formattedCategory,
                    categoryDisplay,
                    topPropsWithCount,
                    isHighImpact
                }
            })
        
        // Sort files by number of categories used (most complex first)
        fileUsageData.sort((a, b) => b.totalCategories - a.totalCategories)
        
        // Prepare file data for template
        fileUsageData.forEach(fileData => {
            fileData.fileLink = utils.createFileLink(fileData.file, repoUrl)
            fileData.propsDisplay = fileData.props.map(p => `\`${p}\``).join(', ')
        })
        
        // Prepare related components for template
        relatedComponents.forEach(rel => {
            const relComponentName = rel.name
            const relPackageName = rel.package || 'unknown-package'
            const safeName = utils.createSafeAnchor(relComponentName)
            rel.componentLink = `[${relComponentName}](../${utils.sanitizePackageName(relPackageName)}/${safeName}.md)`
        })
        
        // Calculate scores for impact breakdown
        const usageScoreRaw = Math.min(100, (component.totalUsages || 0) * 2)
        const fileScoreRaw = Math.min(100, (component.fileCount || 0) * 4)
        const propScoreRaw = Math.min(100, ((component.props?.unique?.length || 0) * 5))
        
        // Calculate special props score
        let specialPropScore = 0
        let specialPropsUsed = []
        if (component.props && component.props.unique) {
            const specialProps = ['className', 'style', 'ref', 'children']
            specialPropScore = specialProps.reduce((score, prop) => {
                if (component.props.unique.includes(prop)) {
                    specialPropsUsed.push(prop)
                    return score + 15
                }
                return score
            }, 0)
        }

        // Determine the primary impact factor
        const scores = [
            { factor: 'Usage frequency', score: usageScoreRaw * 0.4 },
            { factor: 'File distribution', score: fileScoreRaw * 0.3 },
            { factor: 'Prop complexity', score: propScoreRaw * 0.2 },
            { factor: 'Special props', score: specialPropScore * 0.1 }
        ]
        
        // Sort by score to find the highest contributing factor
        scores.sort((a, b) => b.score - a.score)
        const primaryImpactFactor = scores[0].factor
        
        // Calculate prop set statistics for this component
        let propSets = []
        let flexibilityIndex = 0
        let hasPropSets = false
        let hasSimilarPropSets = false
        let similarPropGroups = []
        const similarityThreshold = 75 // 75% similarity threshold
        
        if (component.propSetsByComponent && component.propSetsByComponent.length > 0) {
            hasPropSets = true
            
            // Calculate the "flexibility index" (ratio of unique prop sets to total usages)
            const propSetCount = component.propSetsByComponent.length
            const totalUsages = component.totalUsages || 1 // Avoid division by zero
            flexibilityIndex = ((propSetCount / totalUsages) * 100).toFixed(1)
            
            // Sort prop sets by usage frequency (most common first)
            propSets = component.propSetsByComponent.slice()
                .sort((a, b) => b.files.length - a.files.length)
                .map(propSet => ({
                    props:  propSet.propSet.map(prop => `\`${prop}\``).join(', '),
                    fileCount: propSet.files.length,
                    usagePercentage: ((propSet.files.length / totalUsages) * 100).toFixed(1)
                }))
            
            // Group similar prop sets
            const groups = groupSimilarPropSets(component.propSetsByComponent, similarityThreshold / 100)
            
            // Only process if we have groups with similar prop sets
            if (groups.some(group => group.similar.length > 0)) {
                hasSimilarPropSets = true
                
                // Format groups for template
                similarPropGroups = groups
                    .filter(group => group.similar.length > 0) // Only include groups with similar prop sets
                    .map((group, index) => ({
                        groupNumber: index + 1,
                        baseProps: group.base.propSet.map(prop => `\`${prop}\``).join(', '),
                        allProps: Array.from(group.allProps).map(prop => `\`${prop}\``).join(', '),
                        totalUsage: group.totalUsage,
                        similar: group.similar.map(similar => ({
                            props: similar.propSet.map(prop => `\`${prop}\``).join(', '),
                            fileCount: similar.files.length,
                            similarity: `${(parseFloat(similar.similarity) * 100).toFixed(0)}%`
                        }))
                    }))
            }
        }
        
        // Prepare template data object
        const templateData = {
            component,
            usageCount,
            fileCount,
            uniquePropCount,
            categoryCount,
            impactScore,
            impactLevel: getImpactLevel(impactScore),
            impactScoreExplanation: explainImpactScore(impactScore),
            primaryImpactFactor,
            sortedCategories,
            fileUsageData,
            hasRelatedComponents: relatedComponents.length > 0,
            relatedComponents,
            backToMainLink: utils.createMarkdownLink('← Back to Main Page', '../../index.md'),
            backToComponentAnalysisLink: utils.createMarkdownLink('← Back to Component Analysis', '../../components.md'),
            backToPackageLink: utils.createMarkdownLink(`← Back to ${packageName} Package Index`, './index.md'),
            propSets,
            flexibilityIndex,
            hasPropSets,
            hasSimilarPropSets,
            similarPropGroups,
            similarityThreshold
        }
        
        // Render the template with the data
        return componentFileTemplate(templateData)
    } catch (error) {
        console.error(`Error generating component file for ${component.name}: ${error.stack}`)
        return `# Error\n\nFailed to generate component details for ${component.name}.`
    }
}

module.exports = {
    getImpactLevel,
    explainImpactScore,
    calculateImpactScore,
    getCategoryUsageImpact,
    getComponentFeatureLevel,
    findPropCategory,
    findRelatedComponents,
    calculatePropSetSimilarity,
    groupSimilarPropSets,
    generateComponentFile
} 