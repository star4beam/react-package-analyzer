const jscodeshift = require('jscodeshift')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const { createTransform, ImportAnalyzerConfig } = require('./index')
const { normalizePath, findActualFile, ensureDirectory } = require('./utils/fileUtils')
const { extractImportsFromContent } = require('./utils/importExtractor')
const Reporter = require('./reporters/Reporter')
const { generateMarkdownReport } = require('./reporters/MarkdownReporter')
const { logger: defaultLogger } = require('./utils/logger')

function analyzeDependencyChains(rawPath, config) {
    const logger = config.logger || defaultLogger
    
    try {
        const packageFiles = new Map()
        const fileUsages = new Map()
        const dependencyReport = {}

        // Check if raw.jsonl exists
        if (!fs.existsSync(rawPath)) {
            logger.warn(`Raw data file not found at ${rawPath}, creating an empty one`)
            fs.writeFileSync(rawPath, '', 'utf8')
        }

        // Read raw.jsonl data
        const lines = fs
            .readFileSync(rawPath, 'utf8')
            .split('\n')
            .filter(Boolean)
            .map(line => {
                try {
                    return JSON.parse(line)
                } catch (error) {
                    logger.error('Error parsing JSON line', error)
                    return null // Skip invalid lines instead of throwing
                }
            })
            .filter(item => item !== null) // Remove any null items from invalid JSON

        // Collect files that use tracked packages
        lines.forEach(result => {
            Object.entries(result.usage).forEach(([pkg, usage]) => {
                if (Object.keys(usage).length > 0) {
                    if (!packageFiles.has(pkg)) {
                        packageFiles.set(pkg, new Set())
                    }
                    packageFiles.get(pkg).add(result.file)
                }
            })
        })


        const files = glob.sync(config.include, {
            ignore: config.exclude,
        })


        files.forEach(file => {
            const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/')
            try {
                const content = fs.readFileSync(file, 'utf8')
                
                // Extract all imports using our new utility
                const imports = extractImportsFromContent(content)
                
                // Process the collected imports
                imports.forEach(importPath => {
                    const normalizedPath = normalizePath(importPath, relativePath, config.aliasMap)
                    const actualFile = findActualFile(normalizedPath)
                    
                    if (actualFile) {
                        if (!fileUsages.has(actualFile)) {
                            fileUsages.set(actualFile, new Set())
                        }
                        fileUsages.get(actualFile).add(relativePath)
                    }
                })
            } catch (error) {
                logger.error(`Error processing file ${file}`, error)
                throw error
            }
        })

        // Calculate file usage counts
        const fileUsageCount = new Map()
        fileUsages.forEach((importers, file) => {
            fileUsageCount.set(file, importers.size)
        })

        // Build import chains from file to root
        const buildImportChains = (file, currentChain = [], visited = new Set()) => {
            if (visited.has(file)) return [] // Prevent cycles
            
            visited.add(file)
            const importers = fileUsages.get(file) || new Set()
            
            // If no one imports this file, we've reached a root
            if (importers.size === 0) {
                return [currentChain]
            }
            
            let chains = []
            importers.forEach(importer => {
                // Clone the current chain and add this importer
                const newChain = [...currentChain, importer]
                const importerChains = buildImportChains(importer, newChain, new Set(visited))
                chains = chains.concat(importerChains)
            })
            
            return chains
        }

        const getAllImporters = (file, visited = new Set()) => {
            const result = {
                direct: Array.from(fileUsages.get(file) || []),
                indirect: new Set()
            }
            
            const directImporters = fileUsages.get(file) || new Set()
            directImporters.forEach(importer => {
                if (!visited.has(importer)) {
                    visited.add(importer)
                    const indirectImps = getAllImporters(importer, visited)
                    indirectImps.indirect.forEach(f => {
                        if (fileUsageCount.get(f) > 1) {
                            result.indirect.add(f)
                        }
                    })
                    indirectImps.direct.forEach(f => {
                        if (fileUsageCount.get(f) > 1) {
                            result.indirect.add(f)
                        }
                    })
                }
            })
            
            return result
        }

        // Build dependency report for each package
        packageFiles.forEach((files, pkg) => {
            dependencyReport[pkg] = {
                files: {}
            }
            
            files.forEach(file => {
                const normalizedFile = file.replace(/\.(js|jsx|ts|tsx)$/, '')
                const actualFile = findActualFile(normalizedFile)
                
                if (actualFile) {
                    const importers = getAllImporters(actualFile)
                    // Filter out any importers that aren't used multiple times
                    const multipleDirectImporters = importers.direct.filter(f => fileUsageCount.get(f) > 1)
                    const multipleIndirectImporters = Array.from(importers.indirect).filter(f => fileUsageCount.get(f) > 1)
                    
                    // Build all possible import chains from this file to root files
                    const importChains = buildImportChains(actualFile)
                    
                    if (multipleDirectImporters.length > 0 || multipleIndirectImporters.length > 0 || importChains.length > 0) {
                        dependencyReport[pkg].files[file] = {
                            directImporters: multipleDirectImporters,
                            indirectImporters: multipleIndirectImporters,
                            totalImporters: multipleDirectImporters.length + multipleIndirectImporters.length,
                            importChains: importChains
                        }
                    }
                }
            })
        })

        return dependencyReport
    } catch (error) {
        logger.error('Error analyzing dependency chains', error)
        throw error
    }
}

async function runAnalysis(config) {
    // Use the provided logger or the default one
    const logger = config.logger || defaultLogger
    
    try {
        // Create a multi-step progress tracker for the overall analysis process
        const analysisProgress = logger.createMultiStep('analysis', [
            'Setting up environment',
            'Scanning and analyzing files',
            'Building dependency chains',
            'Generating JSON reports',
            'Generating Markdown report'
        ])
        
        // Step 1: Setting up environment
        analysisProgress.startStep(0)
        
        // Ensure output directory exists
        ensureDirectory(config.outputDir, true)
        logger.debug('Prepared output directory:', { dir: config.outputDir })

        // Create data subdirectory
        const dataDir = path.join(config.outputDir, 'data')
        ensureDirectory(dataDir, true)
        logger.debug('Prepared data directory:', { dir: dataDir })

        // Setup paths and transform
        const rawOutputPath = path.join(dataDir, 'raw.jsonl')
        const transform = createTransform({
            packagesToTrack: config.packagesToTrack,
            aliasMap: config.aliasMap,
            tempFilePath: rawOutputPath
        })
        logger.debug('Raw output path:', { path: rawOutputPath })

        // Initialize empty raw.jsonl file
        fs.writeFileSync(rawOutputPath, '', { encoding: 'utf8' })
        logger.debug('Initialized empty raw output file')
        
        analysisProgress.completeStep()
        
        // Step 2: Scanning and analyzing files
        analysisProgress.startStep(1)
        
        // Process files
        const files = glob.sync(config.include, {
            ignore: config.exclude,
            absolute: true
        })
        logger.info(`Found ${files.length} files to analyze`)
        logger.debug('Files to process:', { count: files.length })
        
        // Create file progress tracker
        const fileProgress = logger.createFileProgressTracker(files.length)

        // Analyze files
        for (const file of files) {
            try {
                fileProgress.increment(file)
                const source = fs.readFileSync(file, 'utf8')
                transform({ 
                    path: path.relative(process.cwd(), file),
                    source 
                }, { jscodeshift }, {})
            } catch (error) {
                logger.error(`Error transforming file ${file}`, error)
                throw error
            }
        }
        
        // Mark file processing as complete
        fileProgress.complete()
        analysisProgress.completeStep()
        
        // Step 3: Building dependency chains
        analysisProgress.startStep(2)
        
        // Create a dedicated task for dependency analysis with newline after completion
        const dependencyTask = logger.createTask('dependencies', 'Analyzing component dependencies', { 
            color: 'cyan', 
            spinner: 'dots',
            addNewLineAfter: true // Add this line to include newline after completion
        })
        
        // Generate dependency chains
        const analyzerConfig = new ImportAnalyzerConfig({
            packagesToTrack: config.packagesToTrack,
            aliasMap: config.aliasMap,
            include: config.include,
            exclude: config.exclude,
            logger
        })
        
        const dependencyResults = analyzeDependencyChains(rawOutputPath, analyzerConfig)
        dependencyTask.succeed('Component dependencies analyzed')
        analysisProgress.completeStep()

        // Parse raw data
        const rawData = fs.readFileSync(rawOutputPath, 'utf8')
            .split('\n')
            .filter(Boolean)
            .map(line => JSON.parse(line))
        logger.debug('Parsed raw data, entries:', rawData.length)

        // Determine formats
        const formats = (config.format || 'json').toLowerCase().split(',')
        logger.debug('Output formats:', formats)

        // Step 4: Generating JSON reports
        analysisProgress.startStep(3)
        
        // Create a task for JSON report generation
        const jsonReportTask = logger.createTask('jsonReports', 'Generating JSON reports', {
            color: 'yellow',
            spinner: 'dots'
        })
        
        // Generate JSON reports
        const reporter = new Reporter(config)
        await reporter.generateReports(rawData, dependencyResults)
        jsonReportTask.succeed('JSON reports generated')
        analysisProgress.completeStep()

        // Step 5: Generating Markdown report
        analysisProgress.startStep(4)
        
        // Create a task for markdown report generation
        const markdownTask = logger.createTask('markdown', 'Generating Markdown report', {
            color: 'green',
            spinner: 'dots'
        })

        // Read report files with error handling
        let detailedReport = null, dependencyReport = null, intersectionsReport = null
        
        try {
            detailedReport = await readJsonReport(dataDir, 'detailed.json')
            logger.debug('Successfully loaded detailed.json')
            markdownTask.update('Loaded detailed.json, processing...')
        } catch (error) {
            markdownTask.fail('Failed to read detailed.json')
            logger.error('Could not read detailed.json', error)
            process.exit(1)
        }
        
        try {
            dependencyReport = await readJsonReport(dataDir, 'dependency-chains.json')
            logger.debug('Successfully loaded dependency-chains.json')
            markdownTask.update('Loaded dependency chains, processing...')
        } catch (error) {
            markdownTask.fail('Failed to read dependency-chains.json')
            logger.error('Could not read dependency-chains.json', error)
            process.exit(1)
        }

        // Load intersections report
        try {
            intersectionsReport = await readJsonReport(dataDir, 'import-intersections.json')
            logger.debug('Successfully loaded import-intersections.json')
            markdownTask.update('Loaded intersection data, generating report...')
        } catch (error) {
            logger.warn(`Could not read import-intersections.json: ${error.message}`)
            markdownTask.update('Proceeding without intersection data...')
            // Continue without intersections report
        }

        await generateMarkdownReport({
            config,
            dependencyReport,
            detailedReport,
            intersectionsReport
        })
        
        markdownTask.succeed('Markdown report generated')
        analysisProgress.completeStep()
        
        // Complete the overall analysis
        analysisProgress.complete('Analysis completed successfully')

        return {
            dependencyChains: dependencyResults,
            rawData
        }
    } catch (error) {
        logger.error('Error running analysis', error)
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
    const logger = defaultLogger
    try {
        const reportPath = path.join(outputDir, filename)
        const fileContent = fs.readFileSync(reportPath, 'utf8')
        return JSON.parse(fileContent)
    } catch (error) {
        logger.error(`Error reading JSON report ${filename}: ${error.message}`)
        process.exit(1)
    }
}

module.exports = { runAnalysis } 