const fs = require('fs')
const path = require('path')
const glob = require('glob')
const jscodeshift = require('jscodeshift')
const { runAnalysis } = require('../../src/runner')
const { createTransform } = require('../../src/index')
const { generateMarkdownReport } = require('../../src/reporters/MarkdownReporter')
const Reporter = require('../../src/reporters/Reporter')

// Mock all dependencies
jest.mock('fs')
jest.mock('glob')
jest.mock('../../src/index')
jest.mock('../../src/utils/fileUtils')
jest.mock('../../src/utils/importExtractor')
jest.mock('../../src/reporters/Reporter')
jest.mock('../../src/reporters/MarkdownReporter')
jest.mock('../../src/utils/logger')

// Import mocked modules
const { ensureDirectory, normalizePath, findActualFile } = require('../../src/utils/fileUtils')
const { extractImportsFromContent } = require('../../src/utils/importExtractor')
const { logger: defaultLogger } = require('../../src/utils/logger')

describe('runner', () => {
    // Mock logger implementation
    const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        createMultiStep: jest.fn(),
        createFileProgressTracker: jest.fn(),
        createTask: jest.fn()
    }
    
    const mockMultiStep = {
        startStep: jest.fn(),
        completeStep: jest.fn(),
        complete: jest.fn()
    }
    
    const mockFileProgress = {
        increment: jest.fn(),
        complete: jest.fn()
    }
    
    const mockTask = {
        update: jest.fn(),
        succeed: jest.fn(),
        fail: jest.fn()
    }
    
    beforeEach(() => {
        jest.clearAllMocks()
        
        // Setup default mock returns
        mockLogger.createMultiStep.mockReturnValue(mockMultiStep)
        mockLogger.createFileProgressTracker.mockReturnValue(mockFileProgress)
        mockLogger.createTask.mockReturnValue(mockTask)
        
        // Set default logger
        defaultLogger.info = mockLogger.info
        defaultLogger.warn = mockLogger.warn
        defaultLogger.error = mockLogger.error
        defaultLogger.debug = mockLogger.debug
        defaultLogger.createMultiStep = mockLogger.createMultiStep
        defaultLogger.createFileProgressTracker = mockLogger.createFileProgressTracker
        defaultLogger.createTask = mockLogger.createTask
        
        // Mock fs defaults
        fs.existsSync.mockReturnValue(true)
        fs.readFileSync.mockReturnValue('')
        fs.writeFileSync.mockImplementation(() => {})
        
        // Mock glob defaults
        glob.sync.mockReturnValue([])
        
        // Mock createTransform
        createTransform.mockReturnValue(jest.fn())
        
        // Mock Reporter
        Reporter.mockImplementation(() => ({
            generateReports: jest.fn().mockResolvedValue()
        }))
        
        // Mock generateMarkdownReport
        generateMarkdownReport.mockResolvedValue()
        
        // Mock import extraction by default
        extractImportsFromContent.mockReturnValue([])
        
        // Mock path utilities
        normalizePath.mockImplementation((path) => path)
        findActualFile.mockReturnValue(null)
    })
    
    describe('runAnalysis', () => {
        const mockConfig = {
            packagesToTrack: ['react'],
            aliasMap: {},
            include: 'src/**/*.js',
            exclude: ['node_modules/**'],
            outputDir: './output',
            format: 'json,markdown'
        }
        
        it('should complete full analysis workflow successfully', async () => {
            const mockFiles = ['/project/src/file1.js', '/project/src/file2.js']
            const mockRawData = [
                { file: 'src/file1.js', usage: { react: { Component: 1 } } },
                { file: 'src/file2.js', usage: { react: { useState: 1 } } }
            ]
            
            glob.sync
                .mockReturnValueOnce(mockFiles) // For file analysis
                .mockReturnValueOnce(['src/file1.js', 'src/file2.js']) // For dependency chains
            
            fs.readFileSync
                .mockReturnValueOnce('import React from "react"') // file1
                .mockReturnValueOnce('import { useState } from "react"') // file2
                .mockReturnValueOnce(mockRawData.map(d => JSON.stringify(d)).join('\n')) // raw.jsonl for dependency analysis
                .mockReturnValueOnce('import React from "react"') // file1 for dependency chains
                .mockReturnValueOnce('import { useState } from "react"') // file2 for dependency chains
                .mockReturnValueOnce(mockRawData.map(d => JSON.stringify(d)).join('\n')) // raw.jsonl for final parse
                .mockReturnValueOnce('{}') // detailed.json
                .mockReturnValueOnce('{}') // dependency-chains.json
                .mockReturnValueOnce('{}') // import-intersections.json
            
            const mockTransform = jest.fn()
            createTransform.mockReturnValue(mockTransform)
            
            const result = await runAnalysis(mockConfig)
            
            // Verify setup
            expect(ensureDirectory).toHaveBeenCalledWith('./output', true)
            expect(ensureDirectory).toHaveBeenCalledWith(path.join('./output', 'data'), true)
            
            // Verify file processing
            expect(glob.sync).toHaveBeenCalledWith('src/**/*.js', {
                ignore: ['node_modules/**'],
                absolute: true
            })
            expect(mockTransform).toHaveBeenCalledTimes(2)
            
            // Verify reports generation
            expect(Reporter).toHaveBeenCalledWith(mockConfig)
            const reporterInstance = Reporter.mock.results[0].value
            expect(reporterInstance.generateReports).toHaveBeenCalled()
            
            // Verify markdown generation
            expect(generateMarkdownReport).toHaveBeenCalled()
            
            // Verify progress tracking
            expect(mockMultiStep.startStep).toHaveBeenCalledTimes(5)
            expect(mockMultiStep.completeStep).toHaveBeenCalledTimes(5)
            expect(mockMultiStep.complete).toHaveBeenCalledWith('Analysis completed successfully')
            
            // Verify result
            expect(result).toHaveProperty('dependencyChains')
            expect(result).toHaveProperty('rawData')
            expect(result.rawData).toEqual(mockRawData)
        })
        
        it('should handle file transformation errors', async () => {
            const mockFiles = ['/project/src/file1.js']
            glob.sync
                .mockReturnValueOnce(mockFiles)
                .mockReturnValueOnce([])
            
            const transformError = new Error('Transform failed')
            fs.readFileSync.mockImplementation((file) => {
                if (file.includes('file1.js')) {
                    throw transformError
                }
                return ''
            })
            
            await expect(runAnalysis(mockConfig)).rejects.toThrow('Transform failed')
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Error transforming file'),
                transformError
            )
        })
        
        it('should handle missing report files gracefully', async () => {
            glob.sync
                .mockReturnValueOnce([]) // For file analysis
                .mockReturnValueOnce([]) // For dependency chains
            
            // Keep track of readFileSync call count
            let readCount = 0
            fs.readFileSync.mockImplementation((file) => {
                readCount++
                // First two reads are for raw.jsonl
                if (readCount <= 2) return ''
                // Then detailed.json fails
                if (file.includes('detailed.json')) {
                    throw new Error('File not found')
                }
                return '{}'
            })
            
            // Mock process.exit to prevent test from exiting
            const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
                throw new Error('Process exit called')
            })
            
            await expect(runAnalysis(mockConfig)).rejects.toThrow('Process exit called')
            
            expect(mockTask.fail).toHaveBeenCalledWith('Failed to read detailed.json')
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Could not read detailed.json',
                expect.any(Error)
            )
            
            mockExit.mockRestore()
        })
        
        it('should continue without intersections report', async () => {
            glob.sync
                .mockReturnValueOnce([]) // For file analysis
                .mockReturnValueOnce([]) // For dependency chains
            
            let callCount = 0
            fs.readFileSync.mockImplementation((file) => {
                callCount++
                // First two are raw.jsonl reads
                if (callCount <= 2) return ''
                // Then report files
                if (file.includes('detailed.json')) return '{}'
                if (file.includes('dependency-chains.json')) return '{}'
                if (file.includes('import-intersections.json')) {
                    throw new Error('File not found')
                }
                return '{}'
            })
            
            await runAnalysis(mockConfig)
            
            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining('Could not read import-intersections.json')
            )
            expect(mockTask.update).toHaveBeenCalledWith('Proceeding without intersection data...')
            expect(generateMarkdownReport).toHaveBeenCalledWith({
                config: mockConfig,
                dependencyReport: {},
                detailedReport: {},
                intersectionsReport: null
            })
        })
        
        it('should use custom logger when provided', async () => {
            const customLogger = {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn(),
                createMultiStep: jest.fn().mockReturnValue(mockMultiStep),
                createFileProgressTracker: jest.fn().mockReturnValue(mockFileProgress),
                createTask: jest.fn().mockReturnValue(mockTask)
            }
            
            const configWithLogger = { ...mockConfig, logger: customLogger }
            
            glob.sync
                .mockReturnValueOnce([]) // For file analysis
                .mockReturnValueOnce([]) // For dependency chains
            fs.readFileSync
                .mockReturnValueOnce('') // raw.jsonl for dependency
                .mockReturnValueOnce('') // raw.jsonl for parse
                .mockReturnValueOnce('{}') // detailed.json
                .mockReturnValueOnce('{}') // dependency-chains.json
                .mockReturnValueOnce('{}') // intersections.json
            
            await runAnalysis(configWithLogger)
            
            expect(customLogger.createMultiStep).toHaveBeenCalled()
            expect(customLogger.info).toHaveBeenCalled()
            expect(customLogger.debug).toHaveBeenCalled()
        })
        
        it('should handle dependency chain analysis errors', async () => {
            glob.sync
                .mockReturnValueOnce([]) // For file analysis
                .mockReturnValueOnce([]) // For dependency chains
            
            // Mock raw.jsonl to have invalid JSON and valid JSON
            let callCount = 0
            fs.readFileSync.mockImplementation((file) => {
                callCount++
                if (callCount === 1) {
                    // First call for dependency analysis - mixed valid/invalid
                    return 'invalid json\n{"file": "test.js", "usage": {}}'
                }
                if (callCount === 2) {
                    // Second call for final parse - only valid
                    return '{"file": "test.js", "usage": {}}'
                }
                // Return proper JSON for report files
                return '{}'
            })
            
            // Even with invalid JSON line, it should continue processing valid lines
            await runAnalysis(mockConfig)
            
            // Should have logged error for invalid JSON but continued
            expect(mockLogger.error).toHaveBeenCalledWith(
                'Error parsing JSON line',
                expect.any(Error)
            )
        })
        
        it('should handle empty package tracking', async () => {
            const configNoPackages = { ...mockConfig, packagesToTrack: [] }
            
            glob.sync
                .mockReturnValueOnce([]) // For file analysis
                .mockReturnValueOnce([]) // For dependency chains
            fs.readFileSync
                .mockReturnValueOnce('') // raw.jsonl for dependency
                .mockReturnValueOnce('') // raw.jsonl for parse
                .mockReturnValueOnce('{}') // detailed.json
                .mockReturnValueOnce('{}') // dependency-chains.json
                .mockReturnValueOnce('{}') // intersections.json
            
            await runAnalysis(configNoPackages)
            
            expect(createTransform).toHaveBeenCalledWith({
                packagesToTrack: [],
                aliasMap: {},
                tempFilePath: expect.any(String)
            })
        })
        
        it('should split format string correctly', async () => {
            const configMultiFormat = { ...mockConfig, format: 'json,markdown,csv' }
            
            glob.sync
                .mockReturnValueOnce([]) // For file analysis
                .mockReturnValueOnce([]) // For dependency chains
            fs.readFileSync
                .mockReturnValueOnce('') // raw.jsonl for dependency
                .mockReturnValueOnce('') // raw.jsonl for parse
                .mockReturnValueOnce('{}') // detailed.json
                .mockReturnValueOnce('{}') // dependency-chains.json
                .mockReturnValueOnce('{}') // intersections.json
            
            await runAnalysis(configMultiFormat)
            
            expect(mockLogger.debug).toHaveBeenCalledWith(
                'Output formats:',
                ['json', 'markdown', 'csv']
            )
        })
    })
    
    describe('analyzeDependencyChains', () => {
        const mockConfig = {
            packagesToTrack: ['react'],
            aliasMap: {},
            include: 'src/**/*.js',
            exclude: ['node_modules/**'],
            outputDir: './output',
            format: 'json,markdown'
        }
        
        // Since analyzeDependencyChains is not exported, we test it through runAnalysis
        it('should build dependency chains correctly', async () => {
            const mockFiles = ['/project/src/ComponentA.js', '/project/src/ComponentB.js']
            const mockRawData = [
                { file: 'src/ComponentA.js', usage: { react: { Component: 1 } } },
                { file: 'src/ComponentB.js', usage: { react: { useState: 1 } } }
            ]
            
            glob.sync
                .mockReturnValueOnce(mockFiles) // For file analysis
                .mockReturnValueOnce(['src/ComponentA.js', 'src/ComponentB.js']) // For dependency chains
            
            // Mock file contents for import extraction
            let readIndex = 0
            fs.readFileSync.mockImplementation((file) => {
                // Handle file reads for transformation
                if (readIndex < 2) {
                    readIndex++
                    if (readIndex === 1) return 'import React from "react"'
                    if (readIndex === 2) return 'import { useState } from "react"\nimport ComponentA from "./ComponentA"'
                }
                
                // Handle raw.jsonl reads
                if (file && file.includes('raw.jsonl')) {
                    return mockRawData.map(d => JSON.stringify(d)).join('\n')
                }
                
                // Handle component file reads for dependency analysis
                if (file && file.includes('ComponentA.js')) {
                    return 'import React from "react"'
                }
                if (file && file.includes('ComponentB.js')) {
                    return 'import { useState } from "react"\nimport ComponentA from "./ComponentA"'
                }
                
                // Default to empty JSON for report files
                return '{}'
            })
            
            // Mock import extraction
            extractImportsFromContent
                .mockReturnValueOnce(['react']) // ComponentA imports (file analysis)
                .mockReturnValueOnce(['react', './ComponentA']) // ComponentB imports (file analysis)
                .mockReturnValueOnce(['react']) // ComponentA imports (dependency chains)
                .mockReturnValueOnce(['react', './ComponentA']) // ComponentB imports (dependency chains)
            
            // Mock path normalization and file finding
            normalizePath
                .mockImplementation((importPath) => {
                    if (importPath === './ComponentA') return 'src/ComponentA.js'
                    return importPath
                })
            
            findActualFile
                .mockImplementation((path) => {
                    if (path === 'src/ComponentA.js') return 'src/ComponentA.js'
                    return null
                })
            
            const result = await runAnalysis({
                ...mockConfig,
                include: 'src/**/*.js',
                exclude: ['node_modules/**']
            })
            
            expect(result.dependencyChains).toBeDefined()
            expect(extractImportsFromContent).toHaveBeenCalledTimes(2) // Only called during dependency chain analysis
        })
        
        it('should handle circular dependencies', async () => {
            const mockFiles = [
                '/project/src/ComponentA.js',
                '/project/src/ComponentB.js'
            ]
            
            glob.sync
                .mockReturnValueOnce(mockFiles) // For file analysis
                .mockReturnValueOnce(['src/ComponentA.js', 'src/ComponentB.js']) // For dependency chains
            
            // Create circular dependency: A imports B, B imports A
            const fileContents = {
                '/project/src/ComponentA.js': 'import ComponentB from "./ComponentB"',
                '/project/src/ComponentB.js': 'import ComponentA from "./ComponentA"',
                'src/ComponentA.js': 'import ComponentB from "./ComponentB"',
                'src/ComponentB.js': 'import ComponentA from "./ComponentA"'
            }
            
            fs.readFileSync.mockImplementation((file) => {
                const key = file.replace(/^\/project\//, '')
                if (fileContents[file]) return fileContents[file]
                if (fileContents[key]) return fileContents[key]
                if (file.includes('raw.jsonl')) return ''
                return '{}'
            })
            
            extractImportsFromContent
                .mockImplementation((content) => {
                    if (content.includes('ComponentB')) return ['./ComponentB']
                    if (content.includes('ComponentA')) return ['./ComponentA']
                    return []
                })
            
            normalizePath.mockImplementation((importPath, fromFile) => {
                if (importPath === './ComponentB') return 'src/ComponentB.js'
                if (importPath === './ComponentA') return 'src/ComponentA.js'
                return importPath
            })
            
            findActualFile.mockImplementation((path) => {
                if (path.includes('Component')) return path
                return null
            })
            
            // Should complete without infinite loop
            await runAnalysis(mockConfig)
            
            expect(mockMultiStep.complete).toHaveBeenCalledWith('Analysis completed successfully')
        })
    })
})