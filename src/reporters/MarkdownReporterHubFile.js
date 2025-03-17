const utils = require('./ReportUtils')
const MainNavigation = require('./MainNavigation')

/**
 * Functions for generating Markdown hub files based on component analysis data.
 */

/**
 * Finds features that use a hub
 * @param {Object} hub - The hub
 * @param {Object} globalImportHubByIntersection - The global import hub by intersection data
 * @returns {Array} Features using the hub
 */
const findFeaturesUsingHub = (hub, globalImportHubByIntersection) => {
    return Object.entries(globalImportHubByIntersection)
        .filter(([_, featureData]) => 
            featureData.hubs.some(h => h.path === hub.path))
        .map(([featurePath, featureData]) => {
            // Find hub in feature.hubs to get dependency type
            const hubData = featureData.hubs.find(h => h.path === hub.path)
            return {
                path: featurePath,
                name: featureData.name,
                hubDependencies: featureData.hubDependencies || [],
                // Include dependency type if available
                dependencyType: hubData ? hubData.dependencyType || 'unknown' : 'unknown'
            }
        })
}

/**
 * Finds features that indirectly use the current hub through a consumer hub
 * @param {Array} consumerHubs - Hubs that use the current hub
 * @param {Object} globalImportHubByIntersection - The global import hub by intersection data
 * @returns {Array} Features indirectly using the current hub
 */
const findIndirectFeatures = (consumerHubs, globalImportHubByIntersection) => {
    const indirectFeatures = []
    
    // For each consumer hub, find features that use it
    consumerHubs.forEach(consumerHub => {
        const featuresUsingConsumer = Object.entries(globalImportHubByIntersection)
            .filter(([_, featureData]) => 
                featureData.hubs.some(h => h.path === consumerHub.path))
            .map(([featurePath, featureData]) => {
                // Find hub in feature.hubs to get dependency type
                const hubData = featureData.hubs.find(h => h.path === consumerHub.path)
                return {
                    path: featurePath,
                    name: featureData.name,
                    consumerHub: consumerHub,
                    hubDependencies: featureData.hubDependencies || [],
                    // Include dependency type if available
                    dependencyType: hubData ? hubData.dependencyType || 'unknown' : 'unknown'
                }
            })
        
        indirectFeatures.push(...featuresUsingConsumer)
    })
    
    // Remove duplicates (in case a feature uses multiple consumer hubs)
    const uniqueFeatures = []
    const featurePaths = new Set()
    
    indirectFeatures.forEach(feature => {
        if (!featurePaths.has(feature.path)) {
            featurePaths.add(feature.path)
            uniqueFeatures.push(feature)
        }
    })
    
    return uniqueFeatures
}

/**
 * Generates the hub overview section
 * @param {Object} hub - The hub
 * @param {Object} config - The configuration
 * @param {Object} hubDependencies - Hub dependency relationships
 * @param {Object} hubUsage - Hub usage relationships
 * @returns {string} The generated markdown content
 */
const generateHubOverviewSection = ({hub, config, hubDependencies, hubUsage}) => {
    let content = '## Hub Overview\n\n'
    
    // Determine hub type
    let hubType = 'Isolated'
    
    // If the hub has dependencies and is used by other hubs
    if (
        hubDependencies && hubDependencies[hub.path] && 
        hubDependencies[hub.path].dependsOn && 
        hubDependencies[hub.path].dependsOn.length > 0 &&
        hubUsage && hubUsage[hub.path] && 
        hubUsage[hub.path].usedBy && 
        hubUsage[hub.path].usedBy.length > 0
    ) {
        hubType = 'Intermediate'
    } 
    // If the hub has dependencies but is not used by other hubs
    else if (
        hubDependencies && hubDependencies[hub.path] && 
        hubDependencies[hub.path].dependsOn && 
        hubDependencies[hub.path].dependsOn.length > 0
    ) {
        hubType = 'Main'
    }
    // If the hub is used by other hubs but doesn't have dependencies
    else if (
        hubUsage && hubUsage[hub.path] && 
        hubUsage[hub.path].usedBy && 
        hubUsage[hub.path].usedBy.length > 0
    ) {
        hubType = 'Base'
    }
    
    content += `- **Hub Type**: ${hubType}\n`
    content += `- **Path**: ${utils.createFileLink(hub.path, config.repoUrl)}\n`
    content += `- **Used by Features**: ${hub.usedByIntersectionsCount}\n`
    content += `- **Total Dependency Paths**: ${hub.dependencyPaths.length}\n`
    content += `- **Packages Used**: ${hub.packages.join(', ')}\n\n`
    
    return content
}

/**
 * Generates the features using hub section
 * @param {Array} featuresUsingHub - The features using the hub
 * @param {Object} config - The configuration
 * @returns {string} The generated markdown content
 */
const generateFeaturesUsingHubSection = ({featuresUsingHub, config}) => {
    let content = '## Features Using This Hub\n\n'
    content += '| Feature | Path |\n'
    content += '|---------|------|\n'
    
    featuresUsingHub.forEach(feature => {
        const featureLink = `../features/${utils.createSafeAnchor(feature.name)}.md`
        content += `| ${utils.createMarkdownLink(feature.name, featureLink)} | ${utils.createFileLink(feature.path, config.repoUrl)} |\n`
    })
    
    content += '\n'
    
    return content
}

/**
 * Generates a table of hubs that the current hub depends on
 * @param {Object} hub - The current hub
 * @param {Object} hubDependencies - Hub dependency relationships
 * @param {Object} config - The configuration 
 * @returns {string} The generated markdown content
 */
const generateDependencyHubsSection = ({hub, hubDependencies, config}) => {
    let content = '## Hubs This Hub Depends On\n\n'
    
    if (hubDependencies && hubDependencies[hub.path] && 
        hubDependencies[hub.path].dependsOn && 
        hubDependencies[hub.path].dependsOn.length > 0) {
        
        // Filter to only include direct dependencies (same as in diagram)
        const directDependencies = hubDependencies[hub.path].dependsOn
        
        if (directDependencies.length > 0) {
            content += '| Hub | Path | Dependency Type |\n'
            content += '|-----|------|----------------|\n'
            
            // Sort dependencies alphabetically by name
            const sortedDependencies = [...directDependencies]
                .sort((a, b) => a.name.localeCompare(b.name))
            
            sortedDependencies.forEach(dependency => {
                const hubLink = `../hubs/${utils.createSafeAnchor(dependency.name)}.md`
                const dependencyType = dependency.dependencyType || 'unknown'
                
                content += `| ${utils.createMarkdownLink(dependency.name, hubLink)} | `
                content += `${utils.createFileLink(dependency.path, config.repoUrl)} | `
                content += `${dependencyType} |\n`
            })
        } else {
            content += 'This hub does not have any direct dependencies on other hubs.\n'
        }
    } else {
        content += 'This hub does not depend on any other hubs.\n'
    }
    
    content += '\n'
    return content
}

/**
 * Formats target components for display
 * @param {Array} componentsUsed - The components used
 * @returns {string} The formatted target components
 */
const formatTargetComponents = (componentsUsed) => {
    // Group components by package
    const targetComponents = {}
    
    componentsUsed.forEach(component => {
        if (!targetComponents[component.package]) {
            targetComponents[component.package] = new Set()
        }
        targetComponents[component.package].add(component.name)
    })
    
    // Format target components
    return Object.entries(targetComponents)
        .map(([pkg, components]) => {
            const componentList = Array.from(components)
                .sort()
                .map(name => {
                    const componentLink = `../components/${utils.sanitizePackageName(pkg)}/${utils.createSafeAnchor(name)}.md`
                    return utils.createMarkdownLink(name, componentLink)
                })
                .join(', ')
            
            return `${componentList} (${pkg})`
        })
        .join('<br>')
}

/**
 * Generates the indirectly used components section
 * @param {Object} hub - The hub
 * @param {Object} detailedReport - The detailed report
 * @param {Object} hubDependencies - Hub dependency relationships
 * @param {Object} config - The configuration
 * @returns {string} The generated markdown content
 */
const generateIndirectComponentsSection = ({hub, detailedReport, hubDependencies, config}) => {
    let content = '## Components Used Indirectly\n\n'
    content += 'This section shows components used by other hubs that this hub depends on.\n\n'
    
    // Get hubs that this hub depends on
    const dependencyHubs = []
    if (hubDependencies && hubDependencies[hub.path] && hubDependencies[hub.path].dependsOn) {
        dependencyHubs.push(...hubDependencies[hub.path].dependsOn)
    }
    
    if (dependencyHubs.length > 0 && detailedReport?.files) {
        content += '| Hub | Components Used |\n'
        content += '| --- | -------------- |\n'
        
        // Sort dependency hubs alphabetically by name
        const sortedHubs = [...dependencyHubs].sort((a, b) => a.name.localeCompare(b.name))
        
        sortedHubs.forEach(depHub => {
            // Find the hub file in the detailed report
            const hubFile = detailedReport.files.find(file => file.path === depHub.path)
            
            if (hubFile?.componentsUsed?.length > 0) {
                // Format target components
                const formattedTargets = formatTargetComponents(hubFile.componentsUsed)
                
                // Add row to table with hub name and link
                const hubLink = utils.createFileLink(depHub.path, config.repoUrl)
                const hubNameWithLink = `[${depHub.name}](../hubs/${utils.createSafeAnchor(depHub.name)}.md) (${hubLink})`
                content += `| ${hubNameWithLink} | ${formattedTargets} |\n`
            }
        })
    } else {
        content += 'This hub does not use any components indirectly through other hubs.\n'
    }
    
    content += '\n'
    
    return content
}

/**
 * Groups components by package for a hub
 * @param {Array} componentsUsed - The components used
 * @returns {Object} Components grouped by package
 */
const groupComponentsByPackageForHub = (componentsUsed) => {
    const componentsByPackage = {}
    
    componentsUsed.forEach(component => {
        if (!componentsByPackage[component.package]) {
            componentsByPackage[component.package] = new Set()
        }
        componentsByPackage[component.package].add(component.name)
    })
    
    return componentsByPackage
}

/**
 * Formats component links for display
 * @param {string} packageName - The package name
 * @param {Set} componentNames - The component names
 * @returns {string} The formatted component links
 */
const formatComponentLinks = (packageName, componentNames) => {
    return Array.from(componentNames)
        .sort()
        .map(componentName => {
            const componentLink = `../components/${utils.sanitizePackageName(packageName)}/${utils.createSafeAnchor(componentName)}.md`
            return utils.createMarkdownLink(componentName, componentLink)
        })
        .join(', ')
}

/**
 * Generates the directly used components section
 * @param {Object} hub - The hub
 * @param {Object} detailedReport - The detailed report
 * @param {Object} config - The configuration
 * @returns {string} The generated markdown content
 */
const generateDirectComponentsSection = ({hub, detailedReport}) => {
    let content = '## Components Used Directly\n\n'
    content += 'This section shows the components directly used by this hub from packages.\n\n'
    
    if (detailedReport?.files) {
        const hubFile = detailedReport.files.find(file => file.path === hub.path)
        
        if (hubFile?.componentsUsed?.length > 0) {
            // Group components by package
            const componentsByPackage = groupComponentsByPackageForHub(hubFile.componentsUsed)
            
            // Create a single table with Package and Components columns
            content += '| Package | Components |\n'
            content += '| ------- | ---------- |\n'
            
            // Sort packages alphabetically
            Object.entries(componentsByPackage)
                .sort(([pkgA], [pkgB]) => pkgA.localeCompare(pkgB))
                .forEach(([packageName, componentNames]) => {
                    // Sort components alphabetically and make them clickable
                    const componentsLinks = formatComponentLinks(packageName, componentNames)
                    
                    content += `| ${packageName} | ${componentsLinks} |\n`
                })
            
            content += '\n'
        } else {
            content += 'No direct component usage from packages found for this hub.\n'
        }
    } else {
        content += 'No file information available in the detailed report.\n'
    }
    
    content += '\n'
    
    return content
}

/**
 * Generates a table of hubs that use the current hub
 * @param {Object} hub - The current hub
 * @param {Object} hubUsage - Hub usage relationships
 * @param {Object} config - The configuration 
 * @returns {string} The generated markdown content
 */
const generateConsumerHubsSection = ({hub, hubUsage, config}) => {
    let content = '## Hubs Using This Hub\n\n'
    
    if (hubUsage && hubUsage[hub.path] && 
        hubUsage[hub.path].usedBy && 
        hubUsage[hub.path].usedBy.length > 0) {
        
        content += '| Hub | Path | Dependency Type |\n'
        content += '|-----|------|----------------|\n'
        
        // Sort consumer hubs alphabetically by name
        const sortedConsumers = [...hubUsage[hub.path].usedBy]
            .sort((a, b) => a.name.localeCompare(b.name))
        
        sortedConsumers.forEach(consumer => {
            const hubLink = `../hubs/${utils.createSafeAnchor(consumer.name)}.md`
            const dependencyType = consumer.dependencyType || 'unknown'
            
            content += `| ${utils.createMarkdownLink(consumer.name, hubLink)} | `
            content += `${utils.createFileLink(consumer.path, config.repoUrl)} | `
            content += `${dependencyType} |\n`
        })
    } else {
        content += 'No other hubs use this hub.\n'
    }
    
    content += '\n'
    return content
}

/**
 * Generates a mermaid diagram showing hub relationships
 * @param {Object} hub - The current hub
 * @param {Array} featuresUsingHub - Features using this hub
 * @param {Object} hubDependencies - Hub dependency relationships
 * @param {Object} hubUsage - Hub usage relationships
 * @param {Object} intersectionsReport - The intersections report for finding indirect features
 * @param {Object} detailedReport - The detailed report
 * @returns {string} The generated mermaid diagram
 */
const generateHubDiagram = ({hub, featuresUsingHub, hubDependencies, hubUsage, intersectionsReport, detailedReport}) => {
    const { globalImportHubByIntersection } = intersectionsReport || {}
    
    let diagram = '## Hub Relationships Diagram\n\n'
    diagram += '```mermaid\nflowchart LR\n'
    
    // Create unique IDs for nodes to avoid mermaid syntax issues
    const makeNodeId = (prefix, name) => {
        return `${prefix}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`
    }
    
    // Style definitions
    diagram += '    %% Node styles\n'
    diagram += '    classDef feature stroke:#0078d7,stroke-width:2px\n'
    diagram += '    classDef currentHub stroke:#ffa500,stroke-width:3px\n'
    diagram += '    classDef main stroke:#d04a02,stroke-width:2px\n'
    diagram += '    classDef intermediate stroke:#7e6000,stroke-width:2px\n'
    diagram += '    classDef base stroke:#006400,stroke-width:2px\n'
    diagram += '    classDef component stroke:#006400,stroke-width:1px\n\n'
    
    // Define link style for different dependency types
    diagram += '    %% Link styles\n'
    diagram += '    linkStyle default stroke:#333,stroke-width:1px\n'
    diagram += '    %% Use different arrow styles for dependency types\n'
    diagram += '    %% Direct: solid line, Indirect: dashed line, Both: thick solid line\n\n'
    
    // Current hub node (center of diagram)
    const currentHubId = makeNodeId('hub', hub.name)
    diagram += `    ${currentHubId}["${hub.name}"]\n`
    
    // Apply current hub style
    diagram += `    class ${currentHubId} currentHub\n\n`
    
    // Track defined nodes to avoid duplicates
    const definedNodes = new Set([currentHubId])
    
    // Track links to assign styles
    const links = []
    
    // Collect all hubs and their relationships for the diagram
    const allRelatedHubs = new Map()
    
    // Add current hub
    allRelatedHubs.set(hub.path, {
        name: hub.name,
        nodeId: currentHubId,
        type: 'current',
        inDependencyOf: new Set(),
        dependsOn: new Set()
    })
    
    // Add features using this hub (top level) within a subgraph
    // We'll also collect indirect features now and add them all in a single subgraph
    
    // Add hubs that use this hub (consumers) - need to collect these first for indirect features
    const consumerHubs = []
    if (hubUsage && hubUsage[hub.path]) {
        hubUsage[hub.path].usedBy.forEach(consumer => {
            // Include both direct and indirect relationships
            const consumerId = makeNodeId('hub', consumer.name)
            
            if (!allRelatedHubs.has(consumer.path)) {
                allRelatedHubs.set(consumer.path, {
                    name: consumer.name,
                    nodeId: consumerId,
                    type: 'consumer',
                    inDependencyOf: new Set(),
                    dependsOn: new Set([hub.path])
                })
            } else {
                allRelatedHubs.get(consumer.path).dependsOn.add(hub.path)
            }
            
            // Mark this hub as being a dependency of the consumer
            allRelatedHubs.get(hub.path).inDependencyOf.add(consumer.path)
            
            // Track consumer hubs for finding indirect features
            consumerHubs.push({
                path: consumer.path,
                name: consumer.name,
                nodeId: consumerId,
                dependencyType: consumer.dependencyType || 'unknown'
            })
        })
    }
    
    // Get indirect features before creating the Features subgraph
    let indirectFeaturesUsingHub = []
    if (globalImportHubByIntersection && consumerHubs.length > 0) {
        indirectFeaturesUsingHub = findIndirectFeatures(consumerHubs, globalImportHubByIntersection)
    }
    
    // Create a single Features subgraph for both direct and indirect features
    if ((featuresUsingHub && featuresUsingHub.length > 0) || 
        (indirectFeaturesUsingHub && indirectFeaturesUsingHub.length > 0)) {
        
        diagram += '    %% Features that use this hub (directly or indirectly)\n'
        diagram += '    subgraph Features["Features"]\n'
        
        // Add all direct features inside the subgraph
        if (featuresUsingHub && featuresUsingHub.length > 0) {
            featuresUsingHub.forEach(feature => {
                const featureId = makeNodeId('feature', feature.name)
                diagram += `        ${featureId}["${feature.name}"]\n`
                diagram += `        class ${featureId} feature\n`
                definedNodes.add(featureId)
            })
        }
        
        // Add all indirect features inside the same subgraph
        if (indirectFeaturesUsingHub && indirectFeaturesUsingHub.length > 0) {
            indirectFeaturesUsingHub.forEach(feature => {
                // Only add if not already added (might be both direct and indirect)
                const featureId = makeNodeId('feature', feature.name)
                if (!definedNodes.has(featureId)) {
                    diagram += `        ${featureId}["${feature.name}"]\n`
                    diagram += `        class ${featureId} feature\n`
                    definedNodes.add(featureId)
                }
            })
        }
        
        diagram += '    end\n\n'
        
        // Connect each direct feature to the current hub with their dependency type
        if (featuresUsingHub && featuresUsingHub.length > 0) {
            featuresUsingHub.forEach(feature => {
                const featureId = makeNodeId('feature', feature.name)
                // Check if we know the dependency type between feature and hub
                let dependencyType = 'direct' // Default to direct
                
                // Try to find the hub in feature's dependencies if available
                if (feature.hubDependencies) {
                    const hubDep = feature.hubDependencies.find(dep => dep.path === hub.path)
                    if (hubDep && hubDep.dependencyType) {
                        dependencyType = hubDep.dependencyType
                    }
                }
                
                // Add link with appropriate style
                const linkIndex = links.length
                if (dependencyType === 'direct') {
                    diagram += `    ${featureId} --> ${currentHubId}\n`
                } else if (dependencyType === 'indirect') {
                    // Skip drawing indirect connections (no line drawn)
                    // But still track the link for reference
                } else if (dependencyType === 'both') {
                    diagram += `    ${featureId} --> ${currentHubId}\n`
                } else {
                    diagram += `    ${featureId} --> ${currentHubId}\n`
                }
                
                links.push({ from: featureId, to: currentHubId, type: dependencyType, index: linkIndex })
            })
        }
        
        // Connect each indirect feature to its consumer hub
        if (indirectFeaturesUsingHub && indirectFeaturesUsingHub.length > 0) {
            indirectFeaturesUsingHub.forEach(feature => {
                const featureId = makeNodeId('feature', feature.name)
                const consumerHubId = makeNodeId('hub', feature.consumerHub.name)
                
                // Check if we know the dependency type between feature and consumer hub
                let dependencyType = 'direct' // Default to direct
                
                // Try to find the hub in feature's dependencies if available
                if (feature.hubDependencies) {
                    const hubDep = feature.hubDependencies.find(dep => dep.path === feature.consumerHub.path)
                    if (hubDep && hubDep.dependencyType) {
                        dependencyType = hubDep.dependencyType
                    }
                }
                
                // Add link with appropriate style
                const linkIndex = links.length
                if (dependencyType === 'direct') {
                    diagram += `    ${featureId} --> ${consumerHubId}\n`
                } else if (dependencyType === 'indirect') {
                    // Skip drawing indirect connections (no line drawn)
                    // But still track the link for reference
                } else if (dependencyType === 'both') {
                    diagram += `    ${featureId} --> ${consumerHubId}\n`
                } else {
                    diagram += `    ${featureId} --> ${consumerHubId}\n`
                }
                
                links.push({ from: featureId, to: consumerHubId, type: dependencyType, index: linkIndex })
            })
        }
    }
    
    // Add hubs this hub depends on
    if (hubDependencies && hubDependencies[hub.path]) {
        hubDependencies[hub.path].dependsOn.forEach(dependency => {
            // Include both direct and indirect relationships
            const dependencyId = makeNodeId('hub', dependency.name)
            
            if (!allRelatedHubs.has(dependency.path)) {
                allRelatedHubs.set(dependency.path, {
                    name: dependency.name,
                    nodeId: dependencyId,
                    type: 'dependency',
                    inDependencyOf: new Set([hub.path]),
                    dependsOn: new Set()
                })
            } else {
                allRelatedHubs.get(dependency.path).inDependencyOf.add(hub.path)
            }
            
            // Mark this hub as depending on the dependency
            allRelatedHubs.get(hub.path).dependsOn.add(dependency.path)
        })
    }
    
    // Find all transitive hub relationships (all direct hub-to-hub connections)
    // This will find direct connections between related hubs that might not
    // directly involve the current hub
    const hubEntries = Array.from(allRelatedHubs.entries())
    for (let i = 0; i < hubEntries.length; i++) {
        const [hubPath, _hubData] = hubEntries[i]
        
        // Skip the current hub (already processed)
        if (hubPath === hub.path) continue
        
        // Find dependencies of this related hub
        if (hubDependencies && hubDependencies[hubPath]) {
            hubDependencies[hubPath].dependsOn.forEach(dependency => {
                // Include both direct and indirect relationships
                // Only add if the dependency is also in our diagram
                if (allRelatedHubs.has(dependency.path)) {
                    allRelatedHubs.get(hubPath).dependsOn.add(dependency.path)
                    allRelatedHubs.get(dependency.path).inDependencyOf.add(hubPath)
                }
            })
        }
    }
    
    // Categorize all hubs
    const baseHubs = []
    const mainHubs = []
    const intermediateHubs = []
    
    allRelatedHubs.forEach((hubData, hubPath) => {
        if (hubPath === hub.path) return // Skip current hub
        
        if (hubData.inDependencyOf.size > 0 && hubData.dependsOn.size > 0) {
            // Both used by other hubs and depends on other hubs
            intermediateHubs.push(hubData)
        } else if (hubData.dependsOn.size > 0) {
            // Only depends on other hubs
            mainHubs.push(hubData)
        } else if (hubData.inDependencyOf.size > 0) {
            // Only used by other hubs
            baseHubs.push(hubData)
        }
    })
    
    // Add nodes for all related hubs by category
    
    // Add base hubs
    if (baseHubs.length > 0) {
        diagram += '    %% Base Hubs\n'
        diagram += '    subgraph BaseHubs["Base Hubs"]\n'
        diagram += '        direction TB\n'
        
        baseHubs.forEach(hubData => {
            if (!definedNodes.has(hubData.nodeId)) {
                diagram += `        ${hubData.nodeId}["${hubData.name}"]\n`
                diagram += `        class ${hubData.nodeId} base\n`
                definedNodes.add(hubData.nodeId)
            }
        })
        
        diagram += '    end\n\n'
    }
    
    // Add intermediate hubs
    if (intermediateHubs.length > 0) {
        diagram += '    %% Intermediate Hubs\n'
        diagram += '    subgraph IntermediateHubs["Intermediate Hubs"]\n'
        diagram += '        direction TB\n'
        
        intermediateHubs.forEach(hubData => {
            if (!definedNodes.has(hubData.nodeId)) {
                diagram += `        ${hubData.nodeId}["${hubData.name}"]\n`
                diagram += `        class ${hubData.nodeId} intermediate\n`
                definedNodes.add(hubData.nodeId)
            }
        })
        
        diagram += '    end\n\n'
    }
    
    // Add main hubs
    if (mainHubs.length > 0) {
        diagram += '    %% Main Hubs\n'
        diagram += '    subgraph MainHubs["Main Hubs"]\n'
        diagram += '        direction TB\n'
        
        mainHubs.forEach(hubData => {
            if (!definedNodes.has(hubData.nodeId)) {
                diagram += `        ${hubData.nodeId}["${hubData.name}"]\n`
                diagram += `        class ${hubData.nodeId} main\n`
                definedNodes.add(hubData.nodeId)
            }
        })
        
        diagram += '    end\n\n'
    }
    
    // Add direct components this hub uses
    if (detailedReport?.files) {
        const hubFile = detailedReport.files.find(file => file.path === hub.path)

        if (hubFile?.componentsUsed?.length > 0) {
            diagram += '    %% Components directly used by this hub\n'

            // Group components by package for cleaner visualization
            const componentsByPackage = {}

            hubFile.componentsUsed.forEach(component => {
                if (!componentsByPackage[component.package]) {
                    componentsByPackage[component.package] = []
                }
                componentsByPackage[component.package].push(component.name)
            })

            // Add components grouped by package (with subgraphs)
            Object.entries(componentsByPackage).forEach(([packageName, components]) => {
                const packageId = makeNodeId('pkg', packageName)

                // Create subgraph for each package
                diagram += `    subgraph ${packageId}["${packageName}"]\n`

                // Add components to the subgraph
                components.forEach(componentName => {
                    const componentId = makeNodeId('comp', `${packageName}_${componentName}`)
                    diagram += `        ${componentId}["${componentName}"]\n`
                    diagram += `        class ${componentId} component\n`
                })

                diagram += '    end\n'

                // Connect current hub to package subgraph
                diagram += `    ${currentHubId} --> ${packageId}\n`
            })

            diagram += '\n'
        }
    }
    
    // Add connections between hubs
    diagram += '    %% Direct hub-to-hub connections\n'
    
    allRelatedHubs.forEach((hubData, hubPath) => {
        // Connect this hub to all its dependencies with proper type
        hubData.dependsOn.forEach(dependencyPath => {
            if (allRelatedHubs.has(dependencyPath)) {
                const dependency = allRelatedHubs.get(dependencyPath)
                
                // Get the dependency type if available
                let dependencyType = 'direct' // Default
                if (hubDependencies && hubDependencies[hubPath]) {
                    const dep = hubDependencies[hubPath].dependsOn.find(d => d.path === dependencyPath)
                    if (dep && dep.dependencyType) {
                        dependencyType = dep.dependencyType
                    }
                }
                
                const linkIndex = links.length
                
                // Use different arrow styles based on dependency type
                if (dependencyType === 'direct') {
                    diagram += `    ${hubData.nodeId} --> ${dependency.nodeId}\n`
                } else if (dependencyType === 'indirect') {
                    // Skip drawing indirect connections (no line drawn)
                    // But still track the link for reference
                } else if (dependencyType === 'both') {
                    diagram += `    ${hubData.nodeId} --> ${dependency.nodeId}\n`
                } else {
                    diagram += `    ${hubData.nodeId} --> ${dependency.nodeId}\n`
                }
                
                links.push({ 
                    from: hubData.nodeId, 
                    to: dependency.nodeId, 
                    type: dependencyType,
                    index: linkIndex
                })
            }
        })
    })
    
    diagram += '```\n\n'
    return diagram
}

/**
 * Generates a hub file
 * @param {Object} hub - The hub to generate a file for
 * @param {Object} intersectionsReport - The intersections report
 * @param {Object} detailedReport - The detailed report
 * @param {Object} config - The configuration
 * @returns {string} The generated markdown content
 */
const generateHubFile = ({hub, intersectionsReport, detailedReport, config}) => {
    const { globalImportHubByIntersection, hubDependencies, hubUsage } = intersectionsReport
    
    // Find features that use this hub
    const featuresUsingHub = findFeaturesUsingHub(hub, globalImportHubByIntersection)
    
    let markdown = ''
    markdown += `# Hub: ${hub.name}\n\n`
    
    // Add navigation with proper relative path
    markdown += MainNavigation.generateCompactNavigation('../', 'hub')
    
    // Add hub overview section
    markdown += generateHubOverviewSection({hub, config, hubDependencies, hubUsage})
    
    // Add relationship diagram
    markdown += generateHubDiagram({
        hub, 
        featuresUsingHub, 
        hubDependencies, 
        hubUsage, 
        intersectionsReport,
        detailedReport
    })
    
    // Add features using this hub section
    markdown += generateFeaturesUsingHubSection({featuresUsingHub, config})
    
    // Add hubs that use this hub section
    markdown += generateConsumerHubsSection({hub, hubUsage, config})
    
    // Add hubs this hub depends on section
    markdown += generateDependencyHubsSection({hub, hubDependencies, config})
    
    // Add components used indirectly section
    markdown += generateIndirectComponentsSection({hub, detailedReport, hubDependencies, config})
    
    // Add directly used components section
    markdown += generateDirectComponentsSection({hub, detailedReport, config})
    
    return markdown
}

module.exports = {
    generateHubFile,
    generateHubOverviewSection,
    generateFeaturesUsingHubSection,
    generateDependencyHubsSection,
    generateConsumerHubsSection,
    generateIndirectComponentsSection,
    generateDirectComponentsSection
} 