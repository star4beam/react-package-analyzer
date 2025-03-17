const fs = require('fs')
const path = require('path')

/**
 * Generates JSON reports from the raw analysis data
 */
class Reporter {
    constructor(config) {
        this.config = config || { outputDir: './reports' }
        this.outputDir = this.config.outputDir
        this.logger = this.config.logger || console
        
        // Create data subdirectory for JSON/JSONL files
        this.dataDir = path.join(this.outputDir, 'data')
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true })
        }
    }

    async generateReports(rawData, dependencyChains) {
        try {
            // Create report generation spinner if logger is available
            const reportTasks = {}
            if (this.logger && this.logger.createTask) {
                reportTasks.summary = this.logger.createTask('summaryReport', 'Generating summary report', { color: 'magenta' })
                reportTasks.detailed = this.logger.createTask('detailedReport', 'Generating detailed report', { color: 'cyan' })
                reportTasks.dependency = this.logger.createTask('dependencyReport', 'Generating dependency report', { color: 'blue' })
                reportTasks.intersection = this.logger.createTask('intersectionReport', 'Generating intersection report', { color: 'yellow' })
            }
            
            // Process data once and reuse the results
            const aggregatedData = this.aggregateResults(rawData)
            const { summary, detailed } = aggregatedData
            
            await Promise.all([
                this.generateSummaryReport(summary, reportTasks.summary),
                this.generateDetailedReport(detailed, reportTasks.detailed),
                this.generateDependencyReport(dependencyChains, reportTasks.dependency),
                this.generateIntersectionReport(dependencyChains, reportTasks.intersection),
            ])
        } catch (error) {
            if (this.logger && this.logger.error) {
                this.logger.error('Error generating reports', error)
            } else {
                console.error(`Error generating reports: ${error.stack}`)
            }
            throw error
        }
    }

    async generateSummaryReport(summary, spinner) {
        try {
            if (!summary) {
                throw new Error('Summary data is undefined')
            }
            await this.writeReport('summary.json', summary)
            if (spinner) spinner.succeed('Summary report generated')
        } catch (error) {
            if (spinner) spinner.fail('Summary report generation failed')
            if (this.logger && this.logger.error) {
                this.logger.error('Error generating summary report', error)
            } else {
                console.error(`Error generating summary report: ${error.stack}`)
            }
            throw error
        }
    }

    async generateDetailedReport(detailed, spinner) {
        try {
            if (!detailed) {
                throw new Error('Detailed data is undefined')
            }
            
            // The prop categories are now handled directly within aggregateResults
            await this.writeReport('detailed.json', detailed)
            if (spinner) spinner.succeed('Detailed report generated')
        } catch (error) {
            if (spinner) spinner.fail('Detailed report generation failed')
            if (this.logger && this.logger.error) {
                this.logger.error('Error generating detailed report', error)
            } else {
                console.error(`Error generating detailed report: ${error.stack}`)
            }
            throw error
        }
    }

    async generateDependencyReport(dependencyChains, spinner) {
        await this.writeReport('dependency-chains.json', dependencyChains)
        if (spinner) spinner.succeed('Dependency report generated')
    }

    /**
     * Generates an intersection report based on the dependency chains
     * @param {import('../../schemas/dependency-chains-json-schema').DependencyChains} dependencyChains - The dependency chains
     * @returns {Promise<Object>} The intersection report

     */
    async generateIntersectionReport(dependencyChains, spinner) {
        try {
            // Initialize collections
            const directImporters = new Set()
            const indirectImporters = new Set()
            const intersectionImporters = new Set()
            
            // Track what packages each file imports from
            const filePackageImports = {}
            
            // Track which files import which other files
            const importRelationships = new Map()
            
            // Track direct component imports by file and package
            const directComponentImports = new Map()
            
            // Track import chains from the dependency data
            const fileImportChains = new Map()
            
            // Process all packages and their files
            Object.entries(dependencyChains).forEach(([packageName, packageData]) => {
                Object.entries(packageData.files || {}).forEach(([filePath, fileData]) => {
                    // Store component info for this file
                    if (!directComponentImports.has(filePath)) {
                        directComponentImports.set(filePath, new Map())
                    }
                    directComponentImports.get(filePath).set(packageName, true)
                    
                    // Store import chains for this file if available
                    if (fileData.importChains && Array.isArray(fileData.importChains)) {
                        if (!fileImportChains.has(filePath)) {
                            fileImportChains.set(filePath, [])
                        }
                        fileImportChains.get(filePath).push(...fileData.importChains)
                    }
                    
                    // Process direct importers
                    (fileData.directImporters || []).forEach(importer => {
                        directImporters.add(importer)
                        
                        // Track package imports for this file
                        if (!filePackageImports[importer]) {
                            filePackageImports[importer] = {
                                directImports: new Set(),
                                indirectImports: new Set()
                            }
                        }
                        filePackageImports[importer].directImports.add(packageName)
                        
                        // Track which files are imported by this importer
                        if (!importRelationships.has(importer)) {
                            importRelationships.set(importer, new Set())
                        }
                        importRelationships.get(importer).add(filePath)
                    });
                    
                    // Process indirect importers
                    (fileData.indirectImporters || []).forEach(importer => {
                        indirectImporters.add(importer)
                        
                        // Track package imports for this file
                        if (!filePackageImports[importer]) {
                            filePackageImports[importer] = {
                                directImports: new Set(),
                                indirectImports: new Set()
                            }
                        }
                        filePackageImports[importer].indirectImports.add(packageName)
                        
                        // Track which files are imported by this indirect importer
                        if (!importRelationships.has(importer)) {
                            importRelationships.set(importer, new Set())
                        }
                        importRelationships.get(importer).add(filePath)
                    })
                })
            })
            
            // Find intersection (files that both directly and indirectly import components)
            directImporters.forEach(file => {
                if (indirectImporters.has(file)) {
                    intersectionImporters.add(file)
                }
            })
            
            // Helper function to extract name from path
            const getNameFromPath = (filePath) => {
                // Split the path into parts
                const parts = filePath.split('/')
                // Get the filename (last part)
                const filename = parts[parts.length - 1]
                
                // Check if it's an index file
                if (filename.startsWith('index.')) {
                    // Use parent directory name if it's an index file and there is a parent
                    if (parts.length > 1) {
                        return parts[parts.length - 2]
                    }
                }
                
                // Otherwise use the filename without extension
                return filename.split('.')[0]
            }
            
            // Function to build import chains
            const buildImportChains = (file, targetPackages, visited = new Set(), depth = 0) => {
                if (depth > 10) return [] // Prevent infinite recursion or too deep chains
                
                const chains = []
                visited.add(file)
                
                if (importRelationships.has(file)) {
                    for (const importedFile of importRelationships.get(file)) {
                        // Check if this imported file has direct component imports of interest
                        if (directComponentImports.has(importedFile)) {
                            const packageMatches = Array.from(directComponentImports.get(importedFile).keys())
                                .filter(pkg => targetPackages.includes(pkg))
                                
                            if (packageMatches.length > 0) {
                                // Found a direct import of interest
                                chains.push({
                                    chain: [file, importedFile],
                                    packages: packageMatches
                                })
                            }
                        }
                        
                        // Recursively check for indirect chains if not visited yet
                        if (!visited.has(importedFile)) {
                            const subChains = buildImportChains(importedFile, targetPackages, new Set(visited), depth + 1)
                            
                            // Add this file to the beginning of each subchain
                            subChains.forEach(subChain => {
                                subChain.chain.unshift(file)
                                chains.push(subChain)
                            })
                        }
                    }
                }
                
                return chains
            }
            
            // Process each intersection file and prepare the report data
            const intersectionData = Array.from(intersectionImporters)
                .sort()
                .map(path => {
                    // Get count of direct importer files this file imports
                    const directImporterImportsCount = 
                        importRelationships.has(path) 
                            ? Array.from(importRelationships.get(path))
                                .filter(imported => directImporters.has(imported)).length
                            : 0
                            
                    // Get count of indirect importer files this file imports
                    const indirectImporterImportsCount = 
                        importRelationships.has(path) 
                            ? Array.from(importRelationships.get(path))
                                .filter(imported => indirectImporters.has(imported)).length
                            : 0
                            
                    // Build import chains for this file
                    const targetPackages = Object.keys(dependencyChains)
                    const importChains = buildImportChains(path, targetPackages)
                    
                    // Group chains by common prefixes (focusing on the second element in the path)
                    const groupedChains = {}
                    importChains.forEach(chain => {
                        if (chain.chain.length >= 2) {
                            // Use the second element in the chain as the grouping key
                            // (first element is always the current file)
                            const secondFile = chain.chain[1]
                            if (!groupedChains[secondFile]) {
                                groupedChains[secondFile] = {
                                    name: getNameFromPath(secondFile),
                                    chains: []
                                }
                            }
                            groupedChains[secondFile].chains.push({
                                path: chain.chain.slice(1), // Remove first element (current file) since it's redundant
                                packages: chain.packages
                            })
                        }
                    })
                            
                    return { 
                        path,
                        name: getNameFromPath(path),
                        directImporterImportsCount,
                        indirectImporterImportsCount,
                        indirectImportChains: importChains.map(chain => ({
                            path: chain.chain,
                            packages: chain.packages
                        })),
                        groupedImportChains: Object.entries(groupedChains).map(([filePath, group]) => ({
                            path: filePath,
                            name: group.name,
                            chainCount: group.chains.length,
                            chains: group.chains
                        }))
                    }
                })
                
            // Analyze global patterns across all intersection files
            const globalImportHubs = new Map()
            
            // Collect all hub files across all intersections
            intersectionData.forEach(intersection => {
                intersection.groupedImportChains.forEach(group => {
                    if (!globalImportHubs.has(group.path)) {
                        globalImportHubs.set(group.path, {
                            path: group.path,
                            name: group.name,
                            usedByIntersections: new Set(),
                            totalChainCount: 0,
                            packages: new Set(),
                            dependencyPaths: new Map()
                        })
                    }
                    
                    const hubData = globalImportHubs.get(group.path)
                    hubData.usedByIntersections.add(intersection.path)
                    hubData.totalChainCount += group.chainCount
                    
                    // Track packages and dependency paths
                    group.chains.forEach(chain => {
                        chain.packages.forEach(pkg => hubData.packages.add(pkg))
                        
                        // Record dependency paths
                        if (chain.path.length > 1) {
                            const nextFile = chain.path[1]
                            if (!hubData.dependencyPaths.has(nextFile)) {
                                hubData.dependencyPaths.set(nextFile, {
                                    count: 0,
                                    packages: new Set()
                                })
                            }
                            
                            const pathData = hubData.dependencyPaths.get(nextFile)
                            pathData.count++
                            chain.packages.forEach(pkg => pathData.packages.add(pkg))
                        }
                    })
                })
            })
            
            // Enhanced helper function to get context-aware names for hubs with duplicates
            const getContextualizedNames = (pathsMap) => {
                // First, extract basic names
                const basicNames = Array.from(pathsMap.entries()).map(([path, data]) => ({
                    path,
                    basicName: data.name
                }))
                
                // Find duplicate names
                const nameCounts = {}
                basicNames.forEach(item => {
                    if (!nameCounts[item.basicName]) {
                        nameCounts[item.basicName] = 0
                    }
                    nameCounts[item.basicName]++
                })
                
                // Create a map of paths to contextualized names
                const contextualizedNames = new Map()
                
                basicNames.forEach(item => {
                    const { path, basicName } = item
                    
                    if (nameCounts[basicName] > 1) {
                        // This is a duplicate name - add context
                        const parts = path.split('/')
                        let contextName = basicName
                        
                        // Add parent directory context for duplicates
                        // Find the parent directory that's not the immediate parent
                        // (which might be the component directory itself)
                        if (parts.length > 2) {
                            const parentDir = parts[parts.length - 2]
                            // If it's an index file, we already used parent dir as name, so go one level up
                            if (parts[parts.length - 1].startsWith('index.') && parts.length > 3) {
                                const grandparentDir = parts[parts.length - 3]
                                contextName = `${basicName} (${grandparentDir})`
                            } else {
                                contextName = `${basicName} (${parentDir})`
                            }
                        }
                        
                        contextualizedNames.set(path, contextName)
                    } else {
                        // This is a unique name - keep it as is
                        contextualizedNames.set(path, basicName)
                    }
                })
                
                return contextualizedNames
            }
            
            // Get contextualized names for hubs
            const hubNames = getContextualizedNames(globalImportHubs)
            
            // Update hub names with contextualized names
            globalImportHubs.forEach((hub, path) => {
                hub.name = hubNames.get(path)
            })
            
            // Convert the hub data to an array and sort by usage count
            const globalHubsArray = Array.from(globalImportHubs.values())
                .map(hub => ({
                    path: hub.path,
                    name: hub.name,
                    usedByIntersectionsCount: hub.usedByIntersections.size,
                    usedByIntersections: Array.from(hub.usedByIntersections),
                    totalChainCount: hub.totalChainCount,
                    packages: Array.from(hub.packages),
                    dependencyPaths: Array.from(hub.dependencyPaths.entries()).map(([path, data]) => ({
                        path,
                        name: hubNames.get(path) || getNameFromPath(path),
                        count: data.count,
                        packages: Array.from(data.packages)
                    }))
                }))
                .sort((a, b) => b.usedByIntersectionsCount - a.usedByIntersectionsCount)
                
            // Organize hubs by intersection - reverse mapping of the global hubs
            const globalImportHubByIntersection = {}
            
            // First create a Map of all hubs for fast lookup
            const hubsMap = new Map(globalHubsArray.map(hub => [hub.path, hub]))
            
            // For each intersection file, find all the hubs it uses
            intersectionData.forEach(intersection => {
                const hubsUsedByThisIntersection = []
                const featurePath = intersection.path
                
                // Create a map to track hub dependency types specifically for this feature
                const featureToHubDependencyTypes = new Map()
                
                // First analyze the import chains to determine direct vs indirect dependencies
                // This helps us determine if the feature directly imports a hub or does it indirectly
                intersection.indirectImportChains.forEach(chain => {
                    if (chain.path.length >= 2) {
                        const importPath = chain.path.slice(1) // Skip the feature itself
                        
                        // Find all hubs in this chain
                        const hubsInChain = importPath.filter(file => hubsMap.has(file))
                        
                        if (hubsInChain.length > 0) {
                            // The first hub in the chain is directly imported by the feature
                            const firstHub = hubsInChain[0]
                            featureToHubDependencyTypes.set(firstHub, 'direct')
                            
                            // All subsequent hubs are indirectly related to the feature
                            for (let i = 1; i < hubsInChain.length; i++) {
                                const currentHub = hubsInChain[i]
                                // Only set as indirect if not already marked as direct
                                if (!featureToHubDependencyTypes.has(currentHub)) {
                                    featureToHubDependencyTypes.set(currentHub, 'indirect')
                                } else if (featureToHubDependencyTypes.get(currentHub) === 'direct') {
                                    // If it's already marked as direct in another chain, then it's both
                                    featureToHubDependencyTypes.set(currentHub, 'both')
                                }
                            }
                        }
                    }
                })
                
                // Go through all grouped chains to find associated hubs
                intersection.groupedImportChains.forEach(group => {
                    if (hubsMap.has(group.path)) {
                        // Add relevant hub data for this intersection
                        const hubData = hubsMap.get(group.path)
                        
                        // Collect only dependency paths that are relevant to this intersection
                        const relevantDependencyPaths = group.chains
                            .filter(chain => chain.path.length > 1)
                            .map(chain => {
                                const nextFile = chain.path[1]
                                // Find matching dependency path in the hub
                                const matchingPath = hubData.dependencyPaths.find(dp => dp.path === nextFile)
                                return matchingPath ? { 
                                    path: nextFile,
                                    name: hubNames.get(nextFile) || getNameFromPath(nextFile),
                                    packages: chain.packages
                                } : null
                            })
                            .filter(Boolean) // Remove nulls
                        
                        // Get dependency type from our feature-specific analysis
                        let dependencyType = 'unknown'
                        if (featureToHubDependencyTypes.has(group.path)) {
                            dependencyType = featureToHubDependencyTypes.get(group.path)
                        } else if (dependencyTypes.has(featurePath) && 
                                 dependencyTypes.get(featurePath).has(group.path)) {
                            // Fall back to global dependency types if not found in our feature analysis
                            dependencyType = dependencyTypes.get(featurePath).get(group.path)
                        }
                        
                        // Add this hub with the specific paths it uses in this intersection
                        hubsUsedByThisIntersection.push({
                            path: hubData.path,
                            name: hubData.name,
                            totalIntersectionsUsingThisHub: hubData.usedByIntersectionsCount,
                            chainsCount: group.chainCount,
                            packages: Array.from(new Set(group.chains.flatMap(chain => chain.packages))),
                            dependencyPaths: relevantDependencyPaths,
                            dependencyType: dependencyType // Add dependency type information
                        })
                    }
                })
                
                // Sort by number of chains (most used hubs for this intersection first)
                hubsUsedByThisIntersection.sort((a, b) => b.chainsCount - a.chainsCount)
                
                // Add to the report data
                globalImportHubByIntersection[intersection.path] = {
                    name: hubNames.get(intersection.path) || intersection.name,
                    hubsCount: hubsUsedByThisIntersection.length,
                    hubs: hubsUsedByThisIntersection
                }
            })
            
            // Analyze dependency relationships between hubs using import chains
            const analyzeDependencyTypes = () => {
                // Create a map to track dependency types between files
                const dependencyTypes = new Map()
                
                // Helper to set or update dependency type
                const setDependencyType = (source, target, type) => {
                    if (!dependencyTypes.has(source)) {
                        dependencyTypes.set(source, new Map())
                    }
                    
                    const currentType = dependencyTypes.get(source).get(target)
                    if (!currentType) {
                        dependencyTypes.get(source).set(target, type)
                    } else if (currentType !== type) {
                        // If already has a different type, it's both direct and indirect
                        dependencyTypes.get(source).set(target, 'both')
                    }
                    // If types match, no need to update
                }
                
                // Process all component files with import chains
                fileImportChains.forEach((chains, source) => {
                    chains.forEach(chain => {
                        // Skip empty chains
                        if (!chain || chain.length < 2) return
                        
                        // Extract the chain path (excluding the source)
                        const importPath = chain.slice(1)
                        
                        // Find all hub files in the chain
                        const hubsInChain = importPath.filter(file => hubsMap.has(file))
                        
                        // Skip if no hubs in chain
                        if (hubsInChain.length === 0) return
                        
                        // IMPORTANT: importChains show the path from a file to its importers (not what the file imports)
                        // So the dependency direction is REVERSED - items in the chain DEPEND ON the source file
                        
                        // For each hub in the chain, it depends on the source file
                        // The first hub in the chain directly depends on the source
                        // Subsequent hubs indirectly depend on the source through other hubs
                        for (let i = 0; i < hubsInChain.length; i++) {
                            const currentHub = hubsInChain[i]
                            
                            // If this is the first hub in the chain, it directly depends on the source
                            if (i === 0) {
                                // Direct relationship FROM first hub TO source
                                setDependencyType(currentHub, source, 'direct')
                            } else {
                                // For all subsequent hubs, the relationship to source is indirect
                                setDependencyType(currentHub, source, 'indirect')
                            }
                            
                            // For each hub's relationship with previous hubs in the chain
                            for (let j = 0; j < i; j++) {
                                const previousHub = hubsInChain[j]
                                
                                // If this is the immediate previous hub, it's a direct relationship
                                if (j === i - 1) {
                                    setDependencyType(currentHub, previousHub, 'direct')
                                } else {
                                    // Otherwise it's an indirect relationship through other hubs
                                    setDependencyType(currentHub, previousHub, 'indirect')
                                }
                            }
                        }
                    })
                })
                
                return dependencyTypes
            }
            
            // Get dependency types between files
            const dependencyTypes = analyzeDependencyTypes()
            
            // Update hub dependencies with dependency type information
            const hubDependenciesWithTypes = {}
            
            // Track which hubs are used by which other hubs
            const hubUsage = {}
            
            // Process all hubs to find their dependencies with types
            globalHubsArray.forEach(hub => {
                const hubPath = hub.path
                hubDependenciesWithTypes[hubPath] = {
                    name: hub.name,
                    dependsOn: []
                }
                
                // Check all dependency relationships with other hubs
                if (dependencyTypes.has(hubPath)) {
                    dependencyTypes.get(hubPath).forEach((type, dependencyPath) => {
                        if (hubsMap.has(dependencyPath)) {
                            const dependencyHub = hubsMap.get(dependencyPath)
                            hubDependenciesWithTypes[hubPath].dependsOn.push({
                                path: dependencyPath,
                                name: dependencyHub.name,
                                dependencyType: type // direct, indirect, or both
                            })
                            
                            // Update the reverse relationship for hubUsage
                            if (!hubUsage[dependencyPath]) {
                                hubUsage[dependencyPath] = {
                                    name: dependencyHub.name,
                                    usedBy: []
                                }
                            }
                            
                            hubUsage[dependencyPath].usedBy.push({
                                path: hubPath,
                                name: hub.name,
                                dependencyType: type
                            })
                        }
                    })
                }
            })
            
            // Filter out hubs that don't have any dependencies
            Object.keys(hubDependenciesWithTypes).forEach(hubPath => {
                if (hubDependenciesWithTypes[hubPath].dependsOn.length === 0) {
                    delete hubDependenciesWithTypes[hubPath]
                }
            })
            
            // Identify and categorize hubs
            const allHubs = new Map();
            
            // First collect all hub paths and names
            [...Object.entries(hubDependenciesWithTypes || {}), ...Object.entries(hubUsage || {})].forEach(([path, data]) => {
                if (!allHubs.has(path)) {
                    allHubs.set(path, data.name)
                }
            })

            const features = Object.entries(globalImportHubByIntersection)
                .map(([path, data]) => {
                    // Get hub dependencies with types for this feature
                    const hubDependencies = []
                    
                    // First check if we have dependency type information in the hubs array
                    if (data.hubs && data.hubs.length > 0) {
                        data.hubs.forEach(hub => {
                            hubDependencies.push({
                                path: hub.path,
                                name: hub.name,
                                dependencyType: hub.dependencyType || 'unknown'
                            })
                        })
                    } 
                    // Fallback to checking the dependencyTypes map if no data in hubs
                    else if (dependencyTypes.has(path)) {
                        dependencyTypes.get(path).forEach((type, hubPath) => {
                            if (hubsMap.has(hubPath)) {
                                hubDependencies.push({
                                    path: hubPath,
                                    name: hubsMap.get(hubPath).name,
                                    dependencyType: type // direct, indirect, or both
                                })
                            }
                        })
                    }
                    
                    return { 
                        path, 
                        ...data,
                        hubDependencies
                    }
                })
                .sort((a, b) => a.name.localeCompare(b.name))
                .filter(feature => !allHubs.has(feature.path))
            
            const baseHubs = []
            const mainHubs = []
            const intermediateHubs = []
            
            allHubs.forEach((name, path) => {
                const isDependency = hubDependenciesWithTypes && hubDependenciesWithTypes[path]
                const isUsed = hubUsage && hubUsage[path]
                
                if (isDependency && isUsed) {
                    intermediateHubs.push({ path, name })
                } else if (isDependency) {
                    mainHubs.push({ path, name })
                } else if (isUsed) {
                    baseHubs.push({ path, name })
                }
            })


            // Create the final report
            const reportData = {
                stats: {
                    directImportersCount: directImporters.size,
                    indirectImportersCount: indirectImporters.size,
                    intersectionCount: intersectionImporters.size
                },
                intersectionImporters: intersectionData,
                globalImportHubs: globalHubsArray,
                globalImportHubByIntersection,
                features,
                hubDependencies: hubDependenciesWithTypes,
                hubUsage,
                hubCategories: {
                    baseHubs,
                    mainHubs,
                    intermediateHubs
                }
            }
            
            await this.writeReport('import-intersections.json', reportData)
            if (spinner) spinner.succeed('Intersection report generated')
            return reportData
        } catch (error) {
            if (spinner) spinner.fail('Intersection report generation failed')
            if (this.logger && this.logger.error) {
                this.logger.error('Error generating intersection report', error)
            } else {
                console.error(`Error generating intersection report: ${error.stack}`)
            }
            throw error
        }
    }
    async writeReport(filename, data) {
        try {
            if (!data) {
                throw new Error(`No data provided for ${filename}`)
            }
            const reportPath = path.join(this.dataDir, filename)
            await fs.promises.writeFile(
                reportPath,
                JSON.stringify(data, null, 2)
            )
        } catch (error) {
            if (this.logger && this.logger.error) {
                this.logger.error(`Error writing report ${filename}`, error)
            } else {
                console.error(`Error writing report ${filename}: ${error.stack}`)
            }
            throw error
        }
    }

    aggregateResults(rawData) {
        if (!Array.isArray(rawData)) {
            throw new Error('Raw data must be an array')
        }

        const summary = {
            totalFiles: 0,
            totalImports: 0,
            totalComponentsUsed: 0,
            totalPropUsage: 0,
            packageStats: {}
        }

        const detailed = {
            files: [],
            components: []
        }

        if (rawData.length === 0) {
            return { summary, detailed }
        }

        try {
            // Track all components with details
            const componentDetails = {}
            
            // Create a map of component usage data for prop categories
            const componentUsageMap = new Map()
            
            // Track prop sets for each component
            const componentPropSets = {}
            
            // First pass: collect all components and their usage data
            rawData.forEach(fileData => {
                if (!fileData || !fileData.file) return
                
                summary.totalFiles++
                detailed.files.push({
                    path: fileData.file,
                    componentsUsed: []
                })
                
                // Process component usage
                if (fileData.usage) {
                    Object.entries(fileData.usage).forEach(([pkg, components]) => {
                        if (!summary.packageStats[pkg]) {
                            summary.packageStats[pkg] = {
                                totalImports: 0,
                                totalUsages: 0,
                                totalComponents: 0,
                                uniqueComponents: new Set()
                            }
                        }
                        
                        Object.entries(components).forEach(([componentName, usage]) => {
                            // Update package stats
                            summary.packageStats[pkg].totalImports += usage.imported || 0
                            summary.packageStats[pkg].totalUsages += usage.used || 0
                            summary.packageStats[pkg].uniqueComponents.add(componentName)
                            
                            // Track component details
                            const key = `${pkg}/${componentName}`
                            if (!componentDetails[key]) {
                                componentDetails[key] = {
                                    name: componentName,
                                    package: pkg,
                                    totalImports: 0,
                                    totalUsages: 0,
                                    files: new Set(),
                                    props: {
                                        total: 0,
                                        unique: new Set(),
                                        details: {},
                                        categories: {}
                                    }
                                }
                            }
                            
                            // Update component details
                            const compDetail = componentDetails[key]
                            compDetail.totalImports += usage.imported || 0
                            compDetail.totalUsages += usage.used || 0
                            compDetail.files.add(fileData.file)
                            
                            // Extract props array from usage
                            const propsArray = this.extractPropsArray(usage)
                            
                            // Track prop sets for this component
                            if (!componentPropSets[key]) {
                                componentPropSets[key] = []
                            }
                            
                            // Sort props array for consistent comparison
                            const sortedProps = [...propsArray].sort()
                            const propSetKey = sortedProps.join(',')
                            
                            // Check if this exact prop set already exists
                            let propSetExists = false
                            for (const propSet of componentPropSets[key]) {
                                if (propSet.propSetKey === propSetKey) {
                                    // This exact prop set exists, add this file to it
                                    if (!propSet.files.includes(fileData.file)) {
                                        propSet.files.push(fileData.file)
                                    }
                                    propSetExists = true
                                    break
                                }
                            }
                            
                            // If this prop set doesn't exist yet, add it
                            if (!propSetExists && propsArray.length > 0) {
                                componentPropSets[key].push({
                                    propSetKey,
                                    propSet: sortedProps,
                                    files: [fileData.file]
                                })
                            }
                            
                            // Process props if available
                            if (usage.props) {
                                compDetail.props.total += usage.props.total || 0
                                
                                // Handle both array and Set formats for unique props
                                if (usage.props.unique) {
                                    if (Array.isArray(usage.props.unique)) {
                                        usage.props.unique.forEach(prop => {
                                            compDetail.props.unique.add(prop)
                                        })
                                    } else if (usage.props.unique instanceof Set) {
                                        usage.props.unique.forEach(prop => {
                                            compDetail.props.unique.add(prop)
                                        })
                                    }
                                }
                                
                                if (usage.props.details) {
                                    Object.entries(usage.props.details).forEach(([prop, count]) => {
                                        if (!compDetail.props.details[prop]) {
                                            compDetail.props.details[prop] = 0
                                        }
                                        compDetail.props.details[prop] += count
                                    })
                                }
                                
                                // Process categories if available
                                if (usage.props.categories) {
                                    Object.entries(usage.props.categories).forEach(([category, data]) => {
                                        if (!compDetail.props.categories[category]) {
                                            compDetail.props.categories[category] = {
                                                count: 0,
                                                props: {}
                                            }
                                        }
                                        
                                        // Add counts
                                        compDetail.props.categories[category].count += data.count || 0
                                        
                                        // Process categorized props
                                        if (data.props) {
                                            Object.entries(data.props).forEach(([prop, count]) => {
                                                if (!compDetail.props.categories[category].props[prop]) {
                                                    compDetail.props.categories[category].props[prop] = 0
                                                }
                                                compDetail.props.categories[category].props[prop] += count
                                            })
                                        }
                                    })
                                }
                            }
                            
                            // Record component usage in file
                            detailed.files[detailed.files.length - 1].componentsUsed.push({
                                name: componentName,
                                package: pkg,
                                usageCount: usage.used || 0,
                                props: this.extractPropsArray(usage)
                            })
                            
                            // Process prop categories data for componentUsageMap (from addPropCategories logic)
                            if (usage.props?.categories) {
                                if (!componentUsageMap.has(key)) {
                                    componentUsageMap.set(key, {
                                        categories: {},
                                        files: new Set()
                                    })
                                }
                                
                                const componentInfo = componentUsageMap.get(key)
                                componentInfo.files.add(fileData.file)
                                
                                // Merge categories data
                                Object.entries(usage.props.categories).forEach(([category, data]) => {
                                    if (!componentInfo.categories[category]) {
                                        componentInfo.categories[category] = {
                                            count: 0,
                                            props: {}
                                        }
                                    }
                                    
                                    // Add counts
                                    componentInfo.categories[category].count += data.count || 0
                                    
                                    // Merge props within category
                                    Object.entries(data.props || {}).forEach(([prop, count]) => {
                                        if (!componentInfo.categories[category].props[prop]) {
                                            componentInfo.categories[category].props[prop] = 0
                                        }
                                        componentInfo.categories[category].props[prop] += count
                                    })
                                })
                            }
                        })
                    })
                }
            })
            
            // Calculate summary totals
            Object.values(summary.packageStats).forEach(stats => {
                summary.totalImports += stats.totalImports
                summary.totalComponentsUsed += stats.uniqueComponents.size
                stats.totalComponents = stats.uniqueComponents.size
                // Convert Sets to Arrays for JSON serialization
                stats.uniqueComponents = Array.from(stats.uniqueComponents)
            })
            
            // Calculate total prop usage from raw data
            summary.totalPropUsage = 0
            rawData.forEach(fileData => {
                // Add file's total props if available
                if (fileData.totalProps) {
                    summary.totalPropUsage += fileData.totalProps
                } else {
                    // Fall back to calculating from component data if totalProps is not available
                    if (fileData.usage) {
                        Object.values(fileData.usage).forEach(components => {
                            Object.values(components).forEach(usage => {
                                if (usage.props && usage.props.total) {
                                    summary.totalPropUsage += usage.props.total
                                }
                            })
                        })
                    }
                }
            })
            
            // Convert component details to array for detailed report
            detailed.components = Object.values(componentDetails).map(comp => {
                const componentObj = {
                    name: comp.name,
                    package: comp.package,
                    totalImports: comp.totalImports,
                    totalUsages: comp.totalUsages,
                    fileCount: comp.files.size,
                    files: Array.from(comp.files),
                    props: {
                        total: comp.props.total,
                        unique: Array.from(comp.props.unique),
                        details: comp.props.details,
                        categories: comp.props.categories
                    },
                    // Add the propSetsByComponent field
                    propSetsByComponent: []
                }
                
                // Add prop sets data
                const key = `${comp.package}/${comp.name}`
                if (componentPropSets[key]) {
                    // Clean up the propSetKey property which was just for internal use
                    componentObj.propSetsByComponent = componentPropSets[key].map(set => ({
                        propSet: set.propSet,
                        files: set.files
                    }))
                }
                
                // Enhance components with additional category data from componentUsageMap
                if (componentUsageMap.has(key)) {
                    const rawInfo = componentUsageMap.get(key)
                    
                    // Add or update props categories
                    if (!componentObj.props) {
                        componentObj.props = {}
                    }
                    
                    componentObj.props.categories = rawInfo.categories
                    
                    // Update files if missing
                    if (!componentObj.files || componentObj.files.length === 0) {
                        componentObj.files = Array.from(rawInfo.files)
                        componentObj.fileCount = componentObj.files.length
                    }
                }
                
                return componentObj
            })
            
            return { 
                summary,
                detailed
            }
        } catch (error) {
            if (this.logger && this.logger.error) {
                this.logger.error('Error aggregating results', error)
            } else {
                console.error(`Error aggregating results: ${error.stack}`)
            }
            throw error
        }
    }

    // Helper method to extract props array from usage data
    extractPropsArray(usage) {
        if (!usage.props) {
            return []
        }
        
        // Handle both Set and Array formats
        if (usage.props.unique) {
            if (Array.isArray(usage.props.unique)) {
                return usage.props.unique
            } else if (usage.props.unique instanceof Set) {
                return Array.from(usage.props.unique)
            }
        }
        
        // If we have details but no unique array/set
        if (usage.props.details && Object.keys(usage.props.details).length > 0) {
            return Object.keys(usage.props.details)
        }
        
        return []
    }

    // Helper method to find which category a prop belongs to
    findPropCategory(component, propName) {
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

 

}

module.exports = Reporter 