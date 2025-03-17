const utils = require('./ReportUtils')
const tableGenerators = require('./TableGenerators')
const MainNavigation = require('./MainNavigation')
const handlebars = require('handlebars')



// Main report generation function
const generateMainReport = ({ config: _, detailedReport }) => {
    try {
        // Calculate stats for header
        const stats = calculateStats(detailedReport)
        const componentCount = detailedReport.components?.length || 0
        const fileCount = detailedReport.files?.length || 0
        const usageCount = stats.totalUsages || 0
        
        // Get compiled header template and execute it with data
        const headerTemplate = generateHeader()
        const headerContent = headerTemplate({
            components: componentCount,
            files: fileCount,
            usages: usageCount
        })
        
        const sections = [
            MainNavigation.generateCompactNavigation('', 'components.md'),
            headerContent,
            // Add both navigation types - compact at top, full below dashboard
            utils.createMarkdownLink('← Back to Main Page', 'index.md'),
            generateSimplifiedTableOfContents(),
            generateExecutiveSummary(),
            // Add full navigation table before component usage section
            generateComponentUsageOverview(detailedReport),
            generateComponentUsageInsights(detailedReport),
            generateSimplifiedComponentProfilesSection({detailedReport}),
            // Add the new section for prop set analysis
            generatePropSetsAnalysisSection(detailedReport)
        ]

        return sections.join('\n\n')
    } catch (error) {
        console.error(`Error generating main markdown content: ${error.stack}`)
        throw error
    }
}

const generateHeader = () => {
    const template = handlebars.compile(`
# Components Report

## Component Usage Dashboard

| **Summary Stats** | **Value** |
|:---------------------|:------------:|
| **Components Analyzed** | **{{components}}** |
| **Files Affected** | **{{files}}** |
| **Usage Instances** | **{{usages}}** |

---`)
    
    return template // Return the compiled template function
}

const generateSimplifiedTableOfContents = () => {
    const template = handlebars.compile(`
## Table of Contents

1. [Executive Summary](#executive-summary)
   - [Components](#components)
   - [Using This Report](#using-this-report)
2. [Component Usage Overview](#component-usage-overview)
   - [Usage Scope](#usage-scope)
   - [Component Usage Categories](#component-usage-categories)
   - [Package Distribution](#package-distribution)
3. [Component Usage Insights](#component-usage-insights)
   - [Components by Feature Level](#components-by-feature-level)
4. [Component Profiles](#component-profiles)
   - [Top Components by Usage](#top-components-by-usage)
5. [Component Prop Patterns](#component-prop-patterns)
   - [Common Prop Combinations](#common-prop-combinations)
   - [Component Flexibility Index](#component-flexibility-index)`)
    
    return template({})
}

const generateExecutiveSummary = () => {
    const template = handlebars.compile(`
## Executive Summary

### Components

This report provides a quantitative analysis of component usage across your codebase, focusing on measurable patterns such as:

- **Component versatility** (how many different ways components are configured)
- **Usage frequency** (how often each component appears)
- **File distribution** (where components are used)
- **Package distribution** (which libraries are most utilized)

The data reveals usage patterns that can help understand the current structure of your component ecosystem, with special attention to how components are configured across different files.

### Using This Report

1. The **Component Usage Overview** provides statistical distribution of component usage
2. The **Component Usage Insights** organizes components by their versatility levels based on configuration patterns
3. The **Component Profiles** highlights components with the highest usage frequencies
4. The **Component Prop Patterns** analyzes specific prop combinations and standardization

> **Note**: This report uses a multi-dimensional scoring system that prioritizes prop set diversity (different ways components are configured) over simple metrics like prop count. This provides a more accurate picture of how components are actually used across your codebase.`)
    
    return template({})
}

const generateComponentUsageOverview = (detailedReport) => {
    // Calculate basic stats
    const stats = calculateStats(detailedReport)
    
    // Calculate package distribution percentages
    const packageDistribution = stats.packageDistribution || {}
    const totalComponents = stats.totalComponents || 0
    const packagePercentages = Object.entries(packageDistribution)
        .map(([pkg, count]) => ({
            package: pkg, 
            count, 
            percentage: totalComponents > 0 ? Math.round((count / totalComponents) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
    
    // Get component feature level distribution from stats
    const componentsByFeatureLevel = stats.featureLevelDistribution || {
        'High': 0,
        'Medium': 0,
        'Low': 0,
        'Very Low': 0
    }
    
    // Top 10 packages for the template
    const topPackages = packagePercentages.slice(0, 10)
    const remainingPackages = packagePercentages.length > 10 ? packagePercentages.length - 10 : 0
    
    // Calculate percentages for feature levels
    const featureLevelPercentages = {
        high: Math.round((componentsByFeatureLevel['High'] / stats.totalComponents) * 100) || 0,
        medium: Math.round((componentsByFeatureLevel['Medium'] / stats.totalComponents) * 100) || 0,
        low: Math.round((componentsByFeatureLevel['Low'] / stats.totalComponents) * 100) || 0,
        veryLow: Math.round((componentsByFeatureLevel['Very Low'] / stats.totalComponents) * 100) || 0
    }
    
    // Generate bar charts for feature levels
    const featureLevelCharts = {
        high: utils.generateBarChart(componentsByFeatureLevel['High'], stats.totalComponents),
        medium: utils.generateBarChart(componentsByFeatureLevel['Medium'], stats.totalComponents),
        low: utils.generateBarChart(componentsByFeatureLevel['Low'], stats.totalComponents),
        veryLow: utils.generateBarChart(componentsByFeatureLevel['Very Low'], stats.totalComponents)
    }
    
    // Generate Mermaid pie chart for package distribution
    const generatePackageDistributionPieChart = (packagePercentages) => {
        // Take top packages and group the rest as "Other" if needed
        let chartData = [...packagePercentages]
        let otherPercentage = 0
        
        // Group small packages as "Other" for cleaner charts
        if (chartData.length > 7) {
            chartData = chartData.slice(0, 6)
            otherPercentage = packagePercentages
                .slice(6)
                .reduce((sum, pkg) => sum + pkg.percentage, 0)
        }
        
        let mermaidCode = '```mermaid\npie title Package Distribution\n'
        
        // Add each package to the chart
        chartData.forEach(pkg => {
            mermaidCode += `    "${pkg.package}" : ${pkg.percentage}\n`
        })
        
        // Add "Other" category if needed
        if (otherPercentage > 0) {
            mermaidCode += `    "Other Packages" : ${otherPercentage}\n`
        }
        
        mermaidCode += '```'
        return mermaidCode
    }
    
    // Generate Mermaid pie chart for feature levels
    const generateFeatureLevelPieChart = (featureLevelPercentages) => {
        return `\`\`\`mermaid
pie title Component Usage Categories
    "Rich" : ${featureLevelPercentages.high}
    "Standard" : ${featureLevelPercentages.medium}
    "Basic" : ${featureLevelPercentages.low}
    "Minimal" : ${featureLevelPercentages.veryLow}
\`\`\``
    }

    const template = handlebars.compile(`
## Component Usage Overview

### Usage Scope

| Metric | Value | Description |
|--------|-------|-------------|
| **Total Components** | {{stats.totalComponents}} | Number of unique components identified in the codebase |
| **Total Component Usages** | {{stats.totalUsages}} | Total instances of components being used |
| **Files Analyzed** | {{stats.totalFiles}} | Number of source files containing component usage |
| **Average Usage per Component** | {{averageUsage}} | How frequently each component is used on average |

### Component Usage Categories
*(Categorized by usage patterns, prop diversity, and configuration variations)*

{{{featureLevelChart}}}

| Usage Category | Count | % of Total | Distribution |
|------------------|-------|------------|--------------|
| **Rich (High Versatility)** | {{featureLevels.High}} | {{percentages.high}}% | {{charts.high}} |
| **Standard (Medium Versatility)** | {{featureLevels.Medium}} | {{percentages.medium}}% | {{charts.medium}} |
| **Basic (Limited Versatility)** | {{featureLevels.Low}} | {{percentages.low}}% | {{charts.low}} |
| **Minimal (Single-purpose)** | {{featureLevels.[Very Low]}} | {{percentages.veryLow}}% | {{charts.veryLow}} |

> **Note**: Component categories are determined by a weighted score that considers:
> * **Prop Set Diversity**: How many different ways the component is configured (highest weight)
> * **File Distribution**: How widely the component is used across files
> * **Usage Frequency**: How often the component appears in the codebase
> * **Prop Count**: How many different props the component accepts
> * **Usage Standardization**: Whether the component follows consistent usage patterns

### Package Distribution

{{{packageDistributionChart}}}

**Top Packages Breakdown:**

| Package | Component Count | % of Total |
|---------|-----------------|------------|
{{#each packages}}
| {{this.package}} | {{this.count}} | {{this.percentage}}% |
{{/each}}

{{#if remainingPackages}}
*...and {{remainingPackages}} more packages with fewer components.*
{{/if}}`)
    
    return template({
        stats: {
            totalComponents: stats.totalComponents,
            totalUsages: stats.totalUsages,
            totalFiles: stats.totalFiles
        },
        averageUsage: stats.averageUsage.toFixed(1),
        featureLevels: componentsByFeatureLevel,
        percentages: featureLevelPercentages,
        charts: featureLevelCharts,
        packages: topPackages,
        remainingPackages: remainingPackages,
        packageDistributionChart: generatePackageDistributionPieChart(packagePercentages),
        featureLevelChart: generateFeatureLevelPieChart(featureLevelPercentages)
    })
}

const generateComponentUsageInsights = (detailedReport) => {
    // Generate the feature level table - this is now the only table we'll use
    const featureLevelTable = tableGenerators.generateFeatureLevelTable(
        detailedReport, 
        (comp) => tableGenerators.getComponentFeatureLevel(comp)
    )
    
    const template = handlebars.compile(`
## Component Usage Insights

This section organizes components by their measured usage characteristics.

### Components by Feature Level

Components are grouped into categories based on their versatility and usage patterns. The feature level is determined by a weighted scoring system that prioritizes:

1. **Prop Set Diversity** (highest weight): The number of different prop combinations used with the component. This measures true versatility in usage.
2. **File Distribution**: How many different files use the component, indicating its reach across the codebase.
3. **Usage Frequency**: Raw count of component instances, showing overall adoption.
4. **Prop Count**: The number of different props the component accepts, indicating flexibility.
5. **Usage Standardization**: Whether the component follows consistent usage patterns across files.

This multi-dimensional approach provides a more nuanced view of component usage patterns than simple metrics like prop count alone.

{{{featureLevelTable}}}

> **Understanding Feature Levels:**
> - **Rich**: These components show high versatility with many different configurations across files
> - **Standard**: These components have moderate versatility with several distinct usage patterns
> - **Basic**: These components have limited versatility with few configuration variations
> - **Minimal**: These components are used in a single way with minimal configuration options
`)
    
    return template({
        featureLevelTable
    })
}

const generateSimplifiedComponentProfilesSection = ({detailedReport}) => {
    if (!detailedReport || !detailedReport.components) {
        const template = handlebars.compile(`
## Component Profiles

No component data available for analysis.`)
        return template({})
    }
    
    // Sort components by usage count in descending order
    const sortedComponents = [...detailedReport.components]
        .sort((a, b) => {
            // First by usage count (descending)
            const usageDiff = (b.totalUsages || 0) - (a.totalUsages || 0)
            if (usageDiff !== 0) return usageDiff
            
            // Then by file count (descending)
            const fileDiff = (b.fileCount || 0) - (a.fileCount || 0)
            if (fileDiff !== 0) return fileDiff
            
            // Finally alphabetically by name
            return a.name.localeCompare(b.name)
        })
    
    // Get the top 15 components
    const topComponents = sortedComponents.slice(0, 15)
    
    // Calculate impact scores using tableGenerators.calculateImpactScore for consistency
    topComponents.forEach(comp => {
        comp.impactScore = tableGenerators.calculateImpactScore(comp)
    })
    
    const template = handlebars.compile(`
## Component Profiles

This section presents the most frequently used components in your codebase based on raw usage count.

### Top Components by Usage

The following components have the highest measured usage frequency in your application:

| Component | Package | Usage Count | Files | Props | Usage Score |
|-----------|---------|-------------|-------|-------|-------------|
{{#each components}}
| {{{componentLink}}} | {{package}} | {{totalUsages}} | {{fileCount}} | {{propCount}} | {{impactScore}} |
{{/each}}

> **Note**: Usage counts shown here represent static imports and JSX usage identified through code analysis. Dynamic usage patterns or runtime behavior are not captured in these metrics.`)
    
    return template({ 
        components: topComponents.map(comp => {
            // Create clickable component link using the same format as in the feature level table
            const name = utils.createSafeAnchor(comp.name)
            const packageName = comp.package || 'unknown-package'
            const sanitizedPackage = utils.sanitizePackageName(packageName)
            const componentLink = `[${comp.name}](./components/${sanitizedPackage}/${name}.md)`
            
            return {
                componentLink: componentLink,
                name: comp.name,
                package: comp.package,
                totalUsages: comp.totalUsages || 0,
                fileCount: comp.fileCount || 0,
                propCount: comp.props?.unique?.length || 0,
                impactScore: comp.impactScore.toFixed(1)
            }
        })
    })
}

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

// Add the new function for prop sets analysis
const generatePropSetsAnalysisSection = (detailedReport) => {
    if (!detailedReport || !detailedReport.components) {
        return '## Component Prop Patterns\n\nNo component data available for prop pattern analysis.'
    }
    
    // Calculate prop set statistics for components
    const componentsWithPropSets = detailedReport.components
        .filter(comp => comp.propSetsByComponent && comp.propSetsByComponent.length > 0)
        .map(comp => {
            // Calculate the "flexibility index" (ratio of unique prop sets to total usages)
            const propSetCount = comp.propSetsByComponent.length
            const totalUsages = comp.totalUsages || 1 // Avoid division by zero
            const flexibilityIndex = (propSetCount / totalUsages) * 100
            
            // Find the most common prop set
            let mostCommonPropSet = { propSet: [], files: [] }
            let mostCommonPropSetUsage = 0
            
            comp.propSetsByComponent.forEach(propSet => {
                if (propSet.files.length > mostCommonPropSetUsage) {
                    mostCommonPropSet = propSet
                    mostCommonPropSetUsage = propSet.files.length
                }
            })
            
            return {
                name: comp.name,
                package: comp.package,
                propSetCount,
                totalUsages,
                flexibilityIndex: flexibilityIndex.toFixed(1),
                mostCommonPropSet,
                mostCommonPropSetUsage
            }
        })
        .sort((a, b) => b.propSetCount - a.propSetCount)
    
    // Get the top 10 components with the most prop combinations
    const topFlexibleComponents = componentsWithPropSets.slice(0, 10)
    
    // Generate a table for components with the most prop set variations
    const topFlexibleComponentsTable = generateFlexibleComponentsTable(topFlexibleComponents)
    
    // Get the top 10 components with the least flexibility (most standardized usage)
    const mostStandardizedComponents = [...componentsWithPropSets]
        .filter(comp => comp.totalUsages >= 5) // Filter for components with meaningful usage count
        .sort((a, b) => parseFloat(a.flexibilityIndex) - parseFloat(b.flexibilityIndex))
        .slice(0, 10)
    
    // Generate a table for components with standardized usage patterns
    const mostStandardizedComponentsTable = generateStandardizedComponentsTable(mostStandardizedComponents)
    
    const template = handlebars.compile(`
## Component Prop Patterns

This section analyzes how components are configured with different prop combinations across your codebase.

### Component Flexibility Index

The flexibility index measures how many different ways a component is configured relative to its total usage. Higher numbers indicate components used with many different prop combinations.

#### Most Flexible Components

The following components are used with the widest variety of prop combinations:

{{{flexibleComponentsTable}}}

#### Most Standardized Components 

The following components show the most consistent usage patterns:

{{{standardizedComponentsTable}}}

> **Note**: For detailed prop combination patterns for each component, please visit the individual component pages.
> **Understanding these patterns:** Examining how components are configured can reveal opportunities for standardization or indicate where components might be too complex or too versatile for their intended purpose.
`)
    
    return template({
        flexibleComponentsTable: topFlexibleComponentsTable,
        standardizedComponentsTable: mostStandardizedComponentsTable,
    })
}

// Helper function to generate table for flexible components
const generateFlexibleComponentsTable = (components) => {
    return `
| Component | Package | Unique Prop Sets | Total Usages | Flexibility Index |
|-----------|---------|------------------|--------------|-------------------|
${components.map(comp => {
        const componentLink = utils.createComponentLink(comp.name, comp.package)
        return `| ${componentLink} | ${comp.package} | ${comp.propSetCount} | ${comp.totalUsages} | ${comp.flexibilityIndex}% |`
    }).join('\n')}

*Flexibility Index = Percentage of unique prop combinations relative to total usage count*
`
}

// Helper function to generate table for standardized components
const generateStandardizedComponentsTable = (components) => {
    return `
| Component | Package | Uses | Variants | Common Props |
|-----------|---------|------|----------|--------------|
${components.map(comp => {
        const componentLink = utils.createComponentLink(comp.name, comp.package)
        const commonProps = comp.mostCommonPropSet.propSet.slice(0, 3).join(', ')
        const moreProps = comp.mostCommonPropSet.propSet.length > 3 ? '...' : ''
        return `| ${componentLink} | ${comp.package} | ${comp.totalUsages} | ${comp.propSetCount} | \`${commonProps}${moreProps}\` |`
    }).join('\n')}
`
}

// Add a helper function to utils
utils.createComponentLink = (componentName, packageName) => {
    const name = utils.createSafeAnchor(componentName)
    const sanitizedPackage = utils.sanitizePackageName(packageName || 'unknown-package')
    return `[${componentName}](./components/${sanitizedPackage}/${name}.md)`
}

// Export the main function and optionally the helper functions
module.exports = {
    generateMainReport,
} 