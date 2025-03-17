const utils = require('./ReportUtils')
const handlebars = require('handlebars')

/**
 * Generate a Mermaid diagram showing hub relationships within a feature
 * @param {Object} featureHubCategories - Categorized hubs used by this feature
 * @param {Object} hubDependencies - Dependencies between hubs
 * @param {Set<string>} featureHubPaths - Set of hub paths used by this feature
 * @param {Object} feature - The feature data
 * @returns {string} Mermaid diagram code
 */
const generateFeatureDependencyMermaid = (featureHubCategories, hubDependencies, featureHubPaths, feature) => {
    const { mainHubs, intermediateHubs, baseHubs } = featureHubCategories
  
    // Start with a top level left-to-right flowchart
    let mermaidCode = 'flowchart LR\n'
    
    // Create unique IDs for nodes to avoid mermaid syntax issues
    const makeNodeId = (prefix, name) => {
        return `${prefix}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`
    }
    
    // Style definitions with improved colors and visual hierarchy
    mermaidCode += '    %% Node styles\n'
    mermaidCode += '    classDef feature stroke:#0078d7,stroke-width:2px\n'
    mermaidCode += '    classDef main stroke:#d04a02,stroke-width:2px\n'
    mermaidCode += '    classDef intermediate stroke:#7e6000,stroke-width:2px\n'
    mermaidCode += '    classDef base stroke:#006400,stroke-width:2px\n'
    mermaidCode += '    classDef isolated stroke:#333,stroke-width:1px,stroke-dasharray: 5 5\n\n'
    
    // Add link style definitions for different dependency types
    mermaidCode += '    %% Link styles\n'
    mermaidCode += '    linkStyle default stroke:#333,stroke-width:1px\n'
    mermaidCode += '    %% Use different arrow styles for dependency types\n'
    mermaidCode += '    %% Direct: solid line, Indirect: dashed line, Both: thick solid line\n\n'
    
    // Add feature node
    const featureId = makeNodeId('feature', feature.name)
    mermaidCode += `    ${featureId}["${feature.name}"]\n`
    mermaidCode += `    class ${featureId} feature\n\n`
    
    // This set keeps track of all hub paths that are directly connected
    // through the dependency chain, even if they aren't directly imported by the feature
    const includedHubPaths = new Set(featureHubPaths)
    
    // This function recursively discovers all hub paths that should be included
    // through direct dependency relationships
    const discoverDirectDependencyPaths = (hubPath, visited = new Set()) => {
        if (visited.has(hubPath)) return // Prevent cycles
        visited.add(hubPath)
        
        // If this hub has dependencies, process them
        if (hubDependencies[hubPath] && hubDependencies[hubPath].dependsOn) {
            hubDependencies[hubPath].dependsOn.forEach(dependency => {
                // Only follow direct dependencies
                if (dependency.dependencyType === 'direct' || dependency.dependencyType === 'both') {
                    includedHubPaths.add(dependency.path)
                    // Recursively discover dependencies of this dependency
                    discoverDirectDependencyPaths(dependency.path, visited)
                }
            })
        }
    }
    
    // Start discovery from each hub that the feature directly imports
    feature.hubs.forEach(hub => {
        if (hub.dependencyType === 'direct' || hub.dependencyType === 'both') {
            discoverDirectDependencyPaths(hub.path)
        }
    })
    
    // Function to determine the hub type for categorization
    const getHubType = (hubPath) => {
        if (mainHubs.find(h => h.path === hubPath)) return 'main'
        if (intermediateHubs.find(h => h.path === hubPath)) return 'intermediate'
        if (baseHubs.find(h => h.path === hubPath)) return 'base'
        return 'isolated'
    }
    
    // Collect all hubs that should be included in the diagram
    const allIncludedHubs = Array.from(includedHubPaths).map(path => {
        // Find the hub data
        const hubData = feature.hubs.find(h => h.path === path) || 
                       { path, name: path.split('/').pop().replace(/\.[^/.]+$/, '') }
        
        // Determine hub type
        const hubType = getHubType(path)
        
        return { ...hubData, hubType }
    })
    
    // Organize hubs by type for the diagram
    const diagramHubs = {
        main: allIncludedHubs.filter(h => h.hubType === 'main'),
        intermediate: allIncludedHubs.filter(h => h.hubType === 'intermediate'),
        base: allIncludedHubs.filter(h => h.hubType === 'base'),
        isolated: allIncludedHubs.filter(h => h.hubType === 'isolated')
    }
    
    // Create subgraphs for each type of hub to control layout
    // Main hubs (top)
    if (diagramHubs.main.length > 0) {
        mermaidCode += '    subgraph MainHubs["Main Hubs"]\n'
        mermaidCode += '        direction TB\n'
        diagramHubs.main.forEach(hub => {
            const hubId = makeNodeId('main', hub.name)
            mermaidCode += `        ${hubId}["${hub.name}"]\n`
            mermaidCode += `        class ${hubId} main\n`
        })
        mermaidCode += '    end\n\n'
    }
    
    // Intermediate hubs (middle)
    if (diagramHubs.intermediate.length > 0) {
        mermaidCode += '    subgraph IntermediateHubs["Intermediate Hubs"]\n'
        mermaidCode += '        direction TB\n'
        diagramHubs.intermediate.forEach(hub => {
            const hubId = makeNodeId('intermediate', hub.name)
            mermaidCode += `        ${hubId}["${hub.name}"]\n`
            mermaidCode += `        class ${hubId} intermediate\n`
        })
        mermaidCode += '    end\n\n'
    }
    
    // Base hubs (bottom)
    if (diagramHubs.base.length > 0) {
        mermaidCode += '    subgraph BaseHubs["Base Hubs"]\n'
        mermaidCode += '        direction TB\n'
        diagramHubs.base.forEach(hub => {
            const hubId = makeNodeId('base', hub.name)
            mermaidCode += `        ${hubId}["${hub.name}"]\n`
            mermaidCode += `        class ${hubId} base\n`
        })
        mermaidCode += '    end\n\n'
    }
    
    // Isolated hubs
    if (diagramHubs.isolated.length > 0) {
        mermaidCode += '    subgraph IsolatedHubs["Isolated Hubs"]\n'
        mermaidCode += '        direction TB\n'
        diagramHubs.isolated.forEach(hub => {
            const hubId = makeNodeId('isolated', hub.name)
            mermaidCode += `        ${hubId}["${hub.name}"]\n`
            mermaidCode += `        class ${hubId} isolated\n`
        })
        mermaidCode += '    end\n\n'
    }
    
    // Create a map of all feature hubs with their dependency type
    const hubDependencyTypes = new Map()
    if (feature.hubs) {
        feature.hubs.forEach(hub => {
            hubDependencyTypes.set(hub.path, hub.dependencyType || 'unknown')
        })
    }
  
    // Add connections from feature to directly imported hubs
    feature.hubs.forEach(hub => {
        // Skip if not direct dependency
        if (hub.dependencyType !== 'direct' && hub.dependencyType !== 'both') return
        
        const hubType = getHubType(hub.path)
        const hubId = makeNodeId(hubType, hub.name)
        
        if (hub.dependencyType === 'direct') {
            mermaidCode += `    ${featureId} --> ${hubId}\n`
        } else if (hub.dependencyType === 'both') {
            mermaidCode += `    ${featureId} ==> ${hubId}\n`
        }
    })
    
    // Track connections added to avoid duplicates
    const addedConnections = new Set()
    
    // Add all direct hub-to-hub connections
    includedHubPaths.forEach(hubPath => {
        if (hubDependencies[hubPath] && hubDependencies[hubPath].dependsOn) {
            // Get source hub info
            const sourceType = getHubType(hubPath)
            const sourceHub = allIncludedHubs.find(h => h.path === hubPath)
            if (!sourceHub) return
            
            const sourceId = makeNodeId(sourceType, sourceHub.name)
            
            // Add connections to all direct dependencies
            hubDependencies[hubPath].dependsOn.forEach(dep => {
                // Only include direct dependencies that are part of our included hubs
                if ((dep.dependencyType === 'direct' || dep.dependencyType === 'both') && 
                    includedHubPaths.has(dep.path)) {
                    
                    const targetType = getHubType(dep.path)
                    const targetId = makeNodeId(targetType, dep.name)
                    
                    // Create a unique key for this connection to avoid duplicates
                    const connectionKey = `${sourceId}->${targetId}`
                    if (!addedConnections.has(connectionKey)) {
                        if (dep.dependencyType === 'direct') {
                            mermaidCode += `    ${sourceId} --> ${targetId}\n`
                        } else if (dep.dependencyType === 'both') {
                            mermaidCode += `    ${sourceId} ==> ${targetId}\n`
                        }
                        addedConnections.add(connectionKey)
                    }
                }
            })
        }
    })
  
    return mermaidCode
}

/**
 * Get components used by a feature, either directly or through hubs
 * @param {import('../../schemas/import-intersections-json-schema').IntersectionHubs} feature - The feature data
 * @param {import('../../schemas/detailed-json-schema').DetailedJsonData} detailedReport - The detailed component analysis report
 * @returns {Array<import('../../schemas/detailed-json-schema').FileComponentUsage>} Array of components used by the feature
 */
const getFeatureComponentUsage = (feature, detailedReport) => {
    const componentUsage = new Set()
    
    // Find direct component usage from the feature file
    if (detailedReport && detailedReport.files) {
        const featureFile = detailedReport.files.find(file => file.path === feature.path)
        
        if (featureFile && featureFile.componentsUsed) {
            featureFile.componentsUsed.forEach(component => {
                componentUsage.add(JSON.stringify(component))
            })
        }
        
        // Find component usage through hubs
        if (feature.hubs && feature.hubs.length > 0) {
            feature.hubs.forEach(hub => {
                if (hub.dependencyPaths) {
                    hub.dependencyPaths.forEach(depPath => {
                        const depFile = detailedReport.files.find(file => file.path === depPath.path)
                        
                        if (depFile && depFile.componentsUsed) {
                            depFile.componentsUsed.forEach(component => {
                                componentUsage.add(JSON.stringify(component))
                            })
                        }
                    })
                }
            })
        }
    }
    
    // Convert back to objects
    return Array.from(componentUsage).map(comp => JSON.parse(comp))
}

// Define Handlebars template
const featureFileTemplate = handlebars.compile(`
# Feature: {{feature.name}}

{{generateCompactNavigation '../' 'feature'}}

## Feature Overview

- **Path**: {{{featurePathLink}}}
- **Total Hubs Used**: {{feature.hubsCount}}

{{#if hubs.length}}
## Hub Dependencies Diagram

This diagram shows the hub relationships within this feature:

\`\`\`mermaid
{{{hubDependencyDiagram}}}
\`\`\`

## Hub Dependencies

{{#if hasMainHubs}}
### Main

| Hub | Dependencies |
|-----|-------------|
{{#each mainHubs}}
| {{{hubLink}}} | {{{dependencyLinks}}} |
{{/each}}

{{/if}}

{{#if hasIntermediateHubs}}
### Intermediate *

<a name="intermediate"></a>

| Hub | Used By | Depends On |
|-----|---------|------------|
{{#each intermediateHubs}}
| {{{hubLink}}} | {{{usedByLinks}}} | {{{dependencyLinks}}} |
{{/each}}

{{/if}}

{{#if hasBaseHubs}}
### Base

| Hub | Used By |
|-----|---------| 
{{#each baseHubs}}
| {{{hubLink}}} | {{{usedByLinks}}} |
{{/each}}

{{/if}}

{{#if hasIsolatedHubs}}
### Isolated Hubs

These hubs are used only within this feature and don't interact with other hubs.

| Hub | Packages |
|-----|----------|
{{#each isolatedHubs}}
| {{{hubLink}}} | {{packages}} |
{{/each}}

{{/if}}

## Component Usage

{{#if componentUsage.length}}
| Package | Components |
|---------|------------|
{{#each componentsByPackage}}
| {{package}} | {{{componentLinks}}} |
{{/each}}
{{else}}
*No components usage detected*
{{/if}}

{{else}}
**No hubs used by this feature.**
{{/if}}
`)

/**
 * Generates markdown content for an individual feature file
 * @param {Object} config - The reporter configuration
 * @param {Object} feature - The feature data from globalImportHubByIntersection
 * @param {import('../../schemas/import-intersections-json-schema').ImportIntersectionsData} intersectionsReport - The intersections report data
 * @param {import('../../schemas/detailed-json-schema').DetailedJsonData} detailedReport - The detailed component analysis report
 * @returns {string} The markdown content
 */
const generateFeatureFile = ({config, feature, intersectionsReport, detailedReport}) => {
    try {
        const { path, hubs } = feature
        const { hubDependencies, hubCategories } = intersectionsReport
        const repoUrl = config.repoUrl || ''
        
        // Create a set of hub paths used by this feature for quick lookups
        const featureHubPaths = new Set(hubs.map(hub => hub.path))
        
        // Filter hub categories to only include hubs used by this feature
        const featureHubCategories = {
            mainHubs: hubCategories.mainHubs.filter(hub => featureHubPaths.has(hub.path)),
            intermediateHubs: hubCategories.intermediateHubs.filter(hub => featureHubPaths.has(hub.path)),
            baseHubs: hubCategories.baseHubs.filter(hub => featureHubPaths.has(hub.path))
        }
        
        // Generate the hub dependency diagram for this feature
        const hubDependencyDiagram = generateFeatureDependencyMermaid(featureHubCategories, hubDependencies, featureHubPaths, feature)
        
        // Prepare main hubs data
        const mainHubs = featureHubCategories.mainHubs.map(hub => {
            const hubName = hub.name
            const hubLink = utils.createMarkdownLink(hubName, `../hubs/${utils.createSafeAnchor(hubName)}.md`)
            
            // Find dependencies
            const hubInfo = hubDependencies[hub.path]
            const dependencies = hubInfo?.dependsOn || []
            
            // Create dependency links
            const dependencyLinks = dependencies
                .map(dep => {
                    const depLink = `../hubs/${utils.createSafeAnchor(dep.name)}.md`
                    return utils.createMarkdownLink(dep.name, depLink)
                })
                .join(', ')
            
            return { hubLink, dependencyLinks }
        })
        
        // Prepare intermediate hubs data
        const intermediateHubs = featureHubCategories.intermediateHubs.map(hub => {
            const hubName = hub.name
            const hubLink = utils.createMarkdownLink(hubName, `../hubs/${utils.createSafeAnchor(hubName)}.md`)
            
            // Find dependencies
            const hubInfo = hubDependencies[hub.path]
            const dependencies = hubInfo?.dependsOn || []
            
            // Find hubs that use this one
            const usedBy = Object.entries(hubDependencies)
                .filter(([hubPath, info]) => {
                    return info.dependsOn?.some(dep => dep.path === hub.path) &&
                           featureHubPaths.has(hubPath) // Only consider hubs used by this feature
                })
                .map(([_, info]) => info.name)
            
            // Create dependency links
            const dependencyLinks = dependencies
                .filter(dep => featureHubPaths.has(dep.path)) // Only consider dependencies used in this feature
                .map(dep => {
                    const depLink = `../hubs/${utils.createSafeAnchor(dep.name)}.md`
                    return utils.createMarkdownLink(dep.name, depLink)
                })
                .join(', ')
            
            // Create usedBy links
            const usedByLinks = usedBy
                .map(name => utils.createMarkdownLink(name, `../hubs/${utils.createSafeAnchor(name)}.md`))
                .join(', ')
            
            return { hubLink, usedByLinks, dependencyLinks }
        })
        
        // Prepare base hubs data
        const baseHubs = featureHubCategories.baseHubs.map(hub => {
            const hubName = hub.name
            const hubLink = utils.createMarkdownLink(hubName, `../hubs/${utils.createSafeAnchor(hubName)}.md`)
            
            // Find hubs that use this one
            const usedBy = Object.entries(hubDependencies)
                .filter(([hubPath, info]) => {
                    return info.dependsOn?.some(dep => dep.path === hub.path) &&
                           featureHubPaths.has(hubPath) // Only consider hubs used by this feature
                })
                .map(([_, info]) => info.name)
            
            // Create usedBy links
            const usedByLinks = usedBy
                .map(name => utils.createMarkdownLink(name, `../hubs/${utils.createSafeAnchor(name)}.md`))
                .join(', ')
            
            return { hubLink, usedByLinks }
        })
        
        // Get component usage
        const componentUsage = getFeatureComponentUsage(feature, detailedReport)
        
        // Group components by package
        const componentsByPackage = []
        const packageGroups = {}
        
        componentUsage.forEach(comp => {
            if (!packageGroups[comp.package]) {
                packageGroups[comp.package] = {
                    package: comp.package,
                    components: []
                }
                componentsByPackage.push(packageGroups[comp.package])
            }
            packageGroups[comp.package].components.push(comp)
        })
        
        // Create component links for each package
        componentsByPackage.forEach(pkg => {
            pkg.componentLinks = pkg.components
                .map(comp => {
                    const compPath = `../components/${utils.sanitizePackageName(pkg.package)}/${utils.createSafeAnchor(comp.name)}.md`
                    return utils.createMarkdownLink(comp.name, compPath)
                })
                .join(', ')
        })
        
        // Identify isolated hubs (those that aren't in any category)
        const categorizedHubPaths = new Set([
            ...featureHubCategories.mainHubs.map(h => h.path),
            ...featureHubCategories.intermediateHubs.map(h => h.path),
            ...featureHubCategories.baseHubs.map(h => h.path)
        ])

        const isolatedHubs = hubs
            .filter(hub => !categorizedHubPaths.has(hub.path))
            .map(hub => ({
                hubLink: utils.createMarkdownLink(hub.name, `../hubs/${utils.createSafeAnchor(hub.name)}.md`),
                packages: hub.packages.join(', ')
            }))
        
        // Create template data object
        const templateData = {
            feature,
            featurePathLink: utils.createFileLink(path, repoUrl),
            hubs,
            mainHubs,
            intermediateHubs,
            baseHubs,
            hasMainHubs: mainHubs.length > 0,
            hasIntermediateHubs: intermediateHubs.length > 0,
            hasBaseHubs: baseHubs.length > 0,
            componentUsage,
            componentsByPackage,
            hasIsolatedHubs: isolatedHubs.length > 0,
            isolatedHubs,
            hubDependencyDiagram
        }
        
        // Render the template with the data
        return featureFileTemplate(templateData)
    } catch (error) {
        console.error(`Error generating feature file for ${feature.name}: ${error.stack}`)
        return `# Error\n\nFailed to generate feature details for ${feature.name}.`
    }
}

module.exports = {
    getFeatureComponentUsage,
    generateFeatureFile,
    generateFeatureDependencyMermaid
} 