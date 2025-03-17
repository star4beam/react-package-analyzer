const handlebars = require('handlebars')
const utils = require('./ReportUtils')

// Generate an explanatory Mermaid diagram showing the concept of features and hubs
const generateExplanatoryFeatureHubDiagram = () => {
    let mermaidCode = 'flowchart LR\n'
  
    // Style definitions for different hub types and features
    mermaidCode += '    classDef feature stroke:#333,stroke-width:2px;\n'
    mermaidCode += '    classDef main stroke:#333,stroke-width:2px;\n'
    mermaidCode += '    classDef intermediate stroke:#333,stroke-width:2px;\n'
    mermaidCode += '    classDef base stroke:#333,stroke-width:2px;\n'
    
    // Create the feature node
    mermaidCode += '    Feature["Example Feature"]\n\n'
    
    // Create subgraphs for each type of hub to show the concept
    // Main hubs
    mermaidCode += '    subgraph Main["Main Hubs"]\n'
    mermaidCode += '        MainHub1["Main Hub 1"]\n'
    mermaidCode += '    end\n\n'
    
    // Intermediate hubs
    mermaidCode += '    subgraph Intermediate["Intermediate Hubs"]\n'
    mermaidCode += '        IntHub1["Intermediate Hub 1"]\n'
    mermaidCode += '        IntHub2["Intermediate Hub 2"]\n'
    mermaidCode += '    end\n\n'
    
    // Base hubs
    mermaidCode += '    subgraph Base["Base Hubs"]\n'
    mermaidCode += '        BaseHub1["Base Hub 1"]\n'
    mermaidCode += '        BaseHub2["Base Hub 2"]\n'
    mermaidCode += '    end\n\n'
  
    // Add connections
    mermaidCode += '    Feature --> MainHub1\n'
    mermaidCode += '    Feature --> IntHub1\n'
    mermaidCode += '    Feature --> BaseHub1\n'
    mermaidCode += '    MainHub1 --> IntHub1\n'
    mermaidCode += '    MainHub1 --> IntHub2\n'
    mermaidCode += '    IntHub1 --> BaseHub1\n'
    mermaidCode += '    IntHub2 --> BaseHub2\n'
  
    // Apply styling
    mermaidCode += '    class Feature feature\n'
    mermaidCode += '    class MainHub1 main\n'
    mermaidCode += '    class IntHub1,IntHub2 intermediate\n'
    mermaidCode += '    class BaseHub1,BaseHub2 base\n'
    mermaidCode += '    class Main main\n'
    mermaidCode += '    class Intermediate intermediate\n'
    mermaidCode += '    class Base base\n'
    
    return mermaidCode
}

// Templates
const featuresOverviewTemplate = `
{{generateCompactNavigation '' 'features.md'}}

# Features Overview

Features are the main intersection points where components from different tracked packages are used together.

## How Features Use Hubs

Features build on reusable hubs to create cohesive functionality. This diagram illustrates the typical relationship:

\`\`\`mermaid
{{{explanatoryDiagram}}}
\`\`\`

- **Features** use components from different packages to implement complete functionality
- **Main Hubs** are used directly by features, but don't contribute to other hubs
- **Intermediate Hubs** are used by both features and other hubs
- **Base Hubs** are foundational components used by intermediate hubs

**Note:** Currently, we do not separate whether certain hubs are used directly or indirectly by features and other hubs. This means the list reflects all unique hubs used by features.

## Features List

| Feature | Main Hubs | Intermediate Hubs | Base Hubs |
|---------|-----------|-------------------|-----------|
{{#each features}}
| {{createMarkdownLink this.name (concat "./features/" (createSafeAnchor this.name) ".md")}} | {{#if this.mainHubs}}{{this.mainHubs}}{{else}}-{{/if}} | {{#if this.intermediateHubs}}{{this.intermediateHubs}}{{else}}-{{/if}} | {{#if this.baseHubs}}{{this.baseHubs}}{{else}}-{{/if}} |
{{/each}}
`

/**
 * Creates a link to a hub page
 * @param {string} hubName - The name of the hub
 * @returns {string} The formatted markdown link
 */
const createHubLink = (hubName) => {
    const hubPageLink = `./hubs/${utils.createSafeAnchor(hubName)}.md`
    return utils.createMarkdownLink(hubName, hubPageLink)
}

/**
 * Creates links for hubs in a category
 * @param {Array} hubs - The hubs to create links for
 * @returns {string} The formatted hub links
 */
const createHubLinksForCategory = (hubs) => {
    if (hubs.length === 0) return '-'
    
    return hubs.map(h => createHubLink(h.name)).join(', ')
}

/**
 * Processes feature data for use in the template
 * @param {Object} feature - The feature to process
 * @param {Object} hubCategories - The hub categories
 * @returns {Object} The processed feature data
 */
const processFeatureData = (feature, hubCategories) => {
    const { name, hubs } = feature
    
    // Create a set of hub paths used by this feature for quick lookups
    const featureHubPaths = new Set(hubs.map(hub => hub.path))
    
    // Filter hub categories to only include hubs used by this feature
    const featureHubs = {
        mainHubs: hubCategories.mainHubs.filter(hub => featureHubPaths.has(hub.path)),
        intermediateHubs: hubCategories.intermediateHubs.filter(hub => featureHubPaths.has(hub.path)),
        baseHubs: hubCategories.baseHubs.filter(hub => featureHubPaths.has(hub.path))
    }
    
    // Create hub links for each category
    return {
        name: name,
        mainHubs: createHubLinksForCategory(featureHubs.mainHubs),
        intermediateHubs: createHubLinksForCategory(featureHubs.intermediateHubs),
        baseHubs: createHubLinksForCategory(featureHubs.baseHubs)
    }
}

/**
 * Generates a report on features and their integration points
 * @param {Object} intersectionsReport - The intersections report data
 * @returns {string} The generated markdown report
 */
const generateFeaturesReport = (intersectionsReport) => {
    const { features, hubCategories } = intersectionsReport
    
    // Compile the template
    const template = handlebars.compile(featuresOverviewTemplate)
    
    // Process features data
    const processedFeatures = features.map(feature => 
        processFeatureData(feature, hubCategories)
    )
    
    // Generate the explanatory diagram
    const explanatoryDiagram = generateExplanatoryFeatureHubDiagram()
    
    // Render the template with data
    return template({ 
        features: processedFeatures,
        explanatoryDiagram
    })
}

module.exports = {
    generateFeaturesReport
} 