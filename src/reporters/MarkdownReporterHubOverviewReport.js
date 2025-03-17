const utils = require('./ReportUtils')
const handlebars = require('handlebars')

// Generate an explanatory Mermaid diagram showing the hub relationship concepts
const generateExplanatoryHubDiagram = () => {
    let mermaidCode = 'flowchart LR\n'
  
    // Style definitions for different hub types
    mermaidCode += '    classDef main stroke:#d04a02,stroke-width:2px;\n'
    mermaidCode += '    classDef intermediate stroke:#7e6000,stroke-width:2px;\n'
    mermaidCode += '    classDef base stroke:#006400,stroke-width:2px;\n'
    
    // Create subgraphs for each type of hub to show the concept
    // Main hubs
    mermaidCode += '    subgraph MainHubs["Main Hubs"]\n'
    mermaidCode += '        MainHub1["Main Hub"]\n'
    mermaidCode += '    end\n\n'
    
    // Intermediate hubs
    mermaidCode += '    subgraph IntermediateHubs["Intermediate Hubs"]\n'
    mermaidCode += '        IntHub1["Intermediate Hub 1"]\n'
    mermaidCode += '        IntHub2["Intermediate Hub 2"]\n'
    mermaidCode += '    end\n\n'
    
    // Base hubs
    mermaidCode += '    subgraph BaseHubs["Base Hubs"]\n'
    mermaidCode += '        BaseHub1["Base Hub 1"]\n'
    mermaidCode += '        BaseHub2["Base Hub 2"]\n'
    mermaidCode += '        BaseHub3["Base Hub 3"]\n'
    mermaidCode += '    end\n\n'
  
    // Add recursive connection pattern with direct connections only
    mermaidCode += '    %% Main hub to first intermediate hub\n'
    mermaidCode += '    MainHub1 --> IntHub1\n'
    
    mermaidCode += '    %% First intermediate hub to second intermediate hub (recursive chain)\n'
    mermaidCode += '    IntHub1 --> IntHub2\n'
    
    mermaidCode += '    %% First intermediate hub to first base hub\n'
    mermaidCode += '    IntHub1 --> BaseHub1\n'
    
    mermaidCode += '    %% Second intermediate hub to second base hub\n'
    mermaidCode += '    IntHub2 --> BaseHub2\n'
    
    mermaidCode += '    %% Main hub directly to third base hub (bypassing intermediate hubs)\n'
    mermaidCode += '    MainHub1 --> BaseHub3\n'
  
    // Apply styling
    mermaidCode += '    class MainHub1 main\n'
    mermaidCode += '    class IntHub1,IntHub2 intermediate\n'
    mermaidCode += '    class BaseHub1,BaseHub2,BaseHub3 base\n'
    mermaidCode += '    class MainHubs main\n'
    mermaidCode += '    class IntermediateHubs intermediate\n'
    mermaidCode += '    class BaseHubs base\n'
    
    return mermaidCode
}

// Define Handlebars template
const hubOverviewTemplate = handlebars.compile(`
{{generateCompactNavigation '' 'hubs.md'}}

# Hubs Overview

**Total Hubs Found: {{totalHubCount}}**

## Hubs

Hubs are intersection points of components that are used by other hubs or features.
In other words, they are the building blocks based on the components of tracked packages.

### Hub Types and Relationships

\`\`\`mermaid
{{{explanatoryDiagram}}}
\`\`\`

- **Main Hubs** ({{mainHubs.length}}): *Rely on Intermediate and Base hubs but are not utilized by other hubs.*
- **Intermediate Hubs** ({{intermediateHubs.length}}): *Both rely on other hubs and are used by other hubs.*
- **Base Hubs** ({{baseHubs.length}}): *Used by other hubs but don't rely on other hubs themselves.*
- **Isolated Hubs** ({{isolatedHubs.length}}): *Used only within their features and don't interact with other hubs.*

Hub dependencies can be:
- **Direct**: The hub directly imports and uses another hub
- **Indirect**: The hub uses another hub through an intermediate hub
- **Both**: The hub both directly and indirectly uses another hub

{{#if mainHubs.length}}
## Main Hubs

These components only depend on other hubs:

| Hub |
|-----|
{{#each sortedMainHubs}}
| {{{hubLink}}} |
{{/each}}

{{/if}}

{{#if intermediateHubs.length}}
<a id="intermediate-hubs"></a>

## Intermediate Hubs*

These components both use and are used by other hubs:

| Hub | Used By Hubs |
|-----|-------------|
{{#each sortedIntermediateHubs}}
| {{{hubLink}}}{{{asteriskLink}}} | {{{usedByLinks}}} |
{{/each}}

{{/if}}

{{#if baseHubs.length}}
## Base Hubs

These components are only used by other hubs:

| Hub | Used By Hubs |
|-----|-------------|
{{#each sortedBaseHubs}}
| {{{hubLink}}} | {{{usedByLinks}}} |
{{/each}}

{{/if}}

{{#if isolatedHubs.length}}
## Isolated Hubs

These components are used only within their features and don't interact with other hubs:

| Hub | Packages | Feature |
|-----|----------|---------|
{{#each sortedIsolatedHubs}}
| {{{hubLink}}} | {{packages}} | {{{featureLink}}} |
{{/each}}

{{/if}}
`)

// Helper function to create a link to a hub page
const createHubLink = (hubName) => {
    const hubPageLink = `./hubs/${utils.createSafeAnchor(hubName)}.md`
    return utils.createMarkdownLink(hubName, hubPageLink)
}
// Helper function to create an asterisk link
const createAsteriskLink = () => {
    return utils.createMarkdownLink('*', '#intermediate-hubs')
}

// Add this function to generate a Mermaid diagram
const generateHubDependencyMermaid = (hubCategories, hubDependencies) => {
    const { mainHubs, intermediateHubs, baseHubs } = hubCategories
  
    let mermaidCode = 'flowchart LR\n'
  
    // Style definitions for different hub types
    mermaidCode += '    classDef main stroke:#333,stroke-width:2px;\n'
    mermaidCode += '    classDef intermediate stroke:#333,stroke-width:2px;\n'
    mermaidCode += '    classDef base stroke:#333,stroke-width:2px;\n'
    
    // Define all nodes directly without subgraphs
    // Main hubs
    mainHubs.forEach(hub => {
        const safeId = hub.name.replace(/[^a-zA-Z0-9]/g, '_')
        mermaidCode += `    ${safeId}["${hub.name}"]\n`
    })
    
    // Intermediate hubs
    intermediateHubs.forEach(hub => {
        const safeId = hub.name.replace(/[^a-zA-Z0-9]/g, '_')
        mermaidCode += `    ${safeId}["${hub.name}"]\n`
    })
    
    // Base hubs
    baseHubs.forEach(hub => {
        const safeId = hub.name.replace(/[^a-zA-Z0-9]/g, '_')
        mermaidCode += `    ${safeId}["${hub.name}"]\n`
    })
  
    // Add connections
    Object.entries(hubDependencies).forEach(([hubPath, dependencies]) => {
        const sourceHub = [...mainHubs, ...intermediateHubs, ...baseHubs].find(h => h.path === hubPath)
        if (sourceHub) {
            const sourceId = sourceHub.name.replace(/[^a-zA-Z0-9]/g, '_');
            (dependencies.dependsOn || []).forEach(dep => {
                const targetId = dep.name.replace(/[^a-zA-Z0-9]/g, '_')
                // Add dependency type to the connection if available
                if (dep.dependencyType === 'direct') {
                    mermaidCode += `    ${sourceId} -->|direct| ${targetId}\n`
                } else if (dep.dependencyType === 'indirect') {
                    mermaidCode += `    ${sourceId} -.->|indirect| ${targetId}\n`
                } else if (dep.dependencyType === 'both') {
                    mermaidCode += `    ${sourceId} ==>|direct+indirect| ${targetId}\n`
                } else {
                    mermaidCode += `    ${sourceId} --> ${targetId}\n`
                }
            })
        }
    })
  
    // Apply styling to nodes
    mainHubs.forEach(hub => {
        const safeId = hub.name.replace(/[^a-zA-Z0-9]/g, '_')
        mermaidCode += `    class ${safeId} main\n`
    })
  
    intermediateHubs.forEach(hub => {
        const safeId = hub.name.replace(/[^a-zA-Z0-9]/g, '_')
        mermaidCode += `    class ${safeId} intermediate\n`
    })
  
    baseHubs.forEach(hub => {
        const safeId = hub.name.replace(/[^a-zA-Z0-9]/g, '_')
        mermaidCode += `    class ${safeId} base\n`
    })
    
    return mermaidCode
}

/**
 * Generates a report on hubs and their dependencies
 * @param {import('../../schemas/import-intersections-json-schema').ImportIntersectionsData} intersectionsReport - The intersections report data
 * @returns {string} The generated markdown report
 */
const generateHubsOverviewReport = (intersectionsReport) => {
    const { hubCategories, hubDependencies, globalImportHubByIntersection, features } = intersectionsReport
    const { mainHubs, intermediateHubs, baseHubs } = hubCategories

    
    // Helper function to determine if a hub is intermediate
    const isIntermediateHub = (hubName) => {
        return intermediateHubs.some(h => h.name === hubName)
    }
    
    
    // Helper function to count intermediate dependencies for a hub
    const countIntermediateDependencies = (hub) => {
        const deps = hubDependencies[hub.path]?.dependsOn || []
        return deps.filter(dep => isIntermediateHub(dep.name)).length
    }
    
    // Helper function to count total dependencies for a hub
    const countTotalDependencies = (hub) => {
        const deps = hubDependencies[hub.path]?.dependsOn || []
        return deps.length
    }
    
    // Prepare main hubs data
    const sortedMainHubs = [...mainHubs].sort((a, b) => {
        const aIntermediateDeps = countIntermediateDependencies(a)
        const bIntermediateDeps = countIntermediateDependencies(b)
        
        // If intermediate dependency counts differ, sort by that first
        if (aIntermediateDeps !== bIntermediateDeps) {
            return bIntermediateDeps - aIntermediateDeps
        }
        
        // If equal intermediate deps, sort by total dependency count
        return countTotalDependencies(b) - countTotalDependencies(a)
    }).map(hub => ({
        hubLink: createHubLink(hub.name)
    }))
    
    // Prepare intermediate hubs data
    const sortedIntermediateHubs = [...intermediateHubs].sort((a, b) => {
        const aIntermediateDeps = countIntermediateDependencies(a)
        const bIntermediateDeps = countIntermediateDependencies(b)
        
        // If intermediate dependency counts differ, sort by that first
        if (aIntermediateDeps !== bIntermediateDeps) {
            return bIntermediateDeps - aIntermediateDeps
        }
        
        // If equal intermediate deps, sort by total dependency count
        return countTotalDependencies(b) - countTotalDependencies(a)
    }).map(hub => {
        // Find which hubs depend on this intermediate hub
        const usedBy = [...mainHubs, ...intermediateHubs].filter(h => 
            h.path !== hub.path && // Exclude self-reference
            (hubDependencies[h.path]?.dependsOn || []).some(dep => dep.path === hub.path)
        )
        
        const usedByLinks = usedBy.length > 0 
            ? usedBy.map(h => {
                const usedByLink = `../hubs/${utils.createSafeAnchor(h.name)}.md`
                const hubLink = utils.createMarkdownLink(h.name, usedByLink)
                // Add asterisk for intermediate hubs
                if (isIntermediateHub(h.name)) {
                    return `${hubLink} ${createAsteriskLink()}`
                }
                return hubLink
            }).join(', ')
            : '-'
        
        return {
            hubLink: createHubLink(hub.name),
            asteriskLink: ` ${createAsteriskLink()}`,
            usedByLinks
        }
    })
    
    // Prepare base hubs data
    const sortedBaseHubs = baseHubs.map(hub => {
        // Find which hubs depend on this base hub
        const usedBy = [...mainHubs, ...intermediateHubs].filter(h => 
            (hubDependencies[h.path]?.dependsOn || []).some(dep => dep.path === hub.path)
        )
        
        const usedByLinks = usedBy.length > 0 
            ? usedBy.map(h => {
                const usedByLink = `../hubs/${utils.createSafeAnchor(h.name)}.md`
                const hubLink = utils.createMarkdownLink(h.name, usedByLink)
                // Add asterisk for intermediate hubs
                if (isIntermediateHub(h.name)) {
                    return `${hubLink} ${createAsteriskLink()}`
                }
                return hubLink
            }).join(', ')
            : '-'
        
        return {
            hubLink: createHubLink(hub.name),
            usedByLinks
        }
    })
    
    // Identify isolated hubs
    // First, create a Set of all the hub paths that are categorized
    const categorizedHubPaths = new Set([
        ...mainHubs.map(hub => hub.path),
        ...intermediateHubs.map(hub => hub.path),
        ...baseHubs.map(hub => hub.path)
    ])
    
    // For each feature, find hubs that are used but not categorized
    const isolatedHubsMap = new Map()
    
    // Process all features to collect isolated hubs
    features.forEach(feature => {
        // For each hub used by the feature
        feature.hubs.forEach(hub => {
            // If the hub is not in any category, it's isolated
            if (!categorizedHubPaths.has(hub.path)) {
                if (!isolatedHubsMap.has(hub.path)) {
                    isolatedHubsMap.set(hub.path, {
                        path: hub.path,
                        name: hub.name,
                        packages: hub.packages,
                        features: new Set()
                    })
                }
                // Add the feature to the list of features using this isolated hub
                isolatedHubsMap.get(hub.path).features.add(feature.path)
            }
        })
    })
    
    // Process all entries in globalImportHubByIntersection to find any hubs not yet categorized
    Object.entries(globalImportHubByIntersection || {}).forEach(([featurePath, featureData]) => {
        featureData.hubs.forEach(hub => {
            if (!categorizedHubPaths.has(hub.path) && !isolatedHubsMap.has(hub.path)) {
                isolatedHubsMap.set(hub.path, {
                    path: hub.path,
                    name: hub.name,
                    packages: hub.packages,
                    features: new Set([featurePath])
                })
            }
        })
    })
    
    // Convert the isolated hubs map to an array and format for display
    const isolatedHubs = Array.from(isolatedHubsMap.values()).map(hub => {
        const featurePath = Array.from(hub.features)[0] // Get the first feature using this hub
        const featureName = features.find(f => f.path === featurePath)?.name || 
                          globalImportHubByIntersection[featurePath]?.name || 
                          'Unknown Feature'
        
        return {
            path: hub.path,
            name: hub.name,
            packages: hub.packages,
            featurePath: featurePath,
            featureName: featureName
        }
    })
    
    // Sort isolated hubs by name for consistency
    const sortedIsolatedHubs = isolatedHubs.sort((a, b) => a.name.localeCompare(b.name)).map(hub => ({
        hubLink: createHubLink(hub.name),
        packages: hub.packages.join(', '),
        featureLink: utils.createMarkdownLink(hub.featureName, `./features/${utils.createSafeAnchor(hub.featureName)}.md`)
    }))
    
    // Create template data object
    const templateData = {
        totalHubCount: mainHubs.length + intermediateHubs.length + baseHubs.length + isolatedHubs.length,
        mainHubs,
        intermediateHubs,
        baseHubs,
        isolatedHubs,
        sortedMainHubs,
        sortedIntermediateHubs,
        sortedBaseHubs,
        sortedIsolatedHubs,
        // Add the mermaid diagram code to the template data
        hubDiagram: generateHubDependencyMermaid(hubCategories, hubDependencies),
        // Add the explanatory diagram
        explanatoryDiagram: generateExplanatoryHubDiagram()
    }
    
    // Render the template with the data
    return hubOverviewTemplate(templateData)
}

module.exports = {generateHubsOverviewReport}