const fs = require('fs')
const path = require('path')
const {
    generateMarkdownReport,
    readJsonReport
} = require('../../../src/reporters/MarkdownReporter')

// Mock all dependencies
jest.mock('fs')
jest.mock('../../../src/reporters/ReportUtils')
jest.mock('../../../src/utils/logger')
jest.mock('../../../src/reporters/MainNavigation')
jest.mock('../../../src/reporters/MarkdownReporterComponentsAnalysis')
jest.mock('../../../src/reporters/MarkdownReporterComponentFile')
jest.mock('../../../src/reporters/MarkdownReporterHubOverviewReport')
jest.mock('../../../src/reporters/MarkdownReporterFeatureFile')
jest.mock('../../../src/reporters/MarkdownReporterIndex')
jest.mock('../../../src/reporters/MarkdownReporterHubFile')
jest.mock('../../../src/reporters/MarkdownReporterFeatures')
jest.mock('../../../src/reporters/MarkdownReporterFiles')
jest.mock('handlebars')

const utils = require('../../../src/reporters/ReportUtils')
const MainNavigation = require('../../../src/reporters/MainNavigation')
const MarkdownReporterComponentsAnalysis = require('../../../src/reporters/MarkdownReporterComponentsAnalysis')
const MarkdownReporterComponentFile = require('../../../src/reporters/MarkdownReporterComponentFile')
const MarkdownReporterHubOverviewReport = require('../../../src/reporters/MarkdownReporterHubOverviewReport')
const MarkdownReporterFeatureFile = require('../../../src/reporters/MarkdownReporterFeatureFile')
const MarkdownReporterIndex = require('../../../src/reporters/MarkdownReporterIndex')
const MarkdownReporterHubFile = require('../../../src/reporters/MarkdownReporterHubFile')
const MarkdownReporterFeatures = require('../../../src/reporters/MarkdownReporterFeatures')
const MarkdownReporterFiles = require('../../../src/reporters/MarkdownReporterFiles')

describe('MarkdownReporter', () => {
    let mockConfig
    let mockDetailedReport
    let mockIntersectionsReport
    let mockDependencyReport
    
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'log').mockImplementation(() => {})
        jest.spyOn(console, 'warn').mockImplementation(() => {})
        jest.spyOn(console, 'error').mockImplementation(() => {})
        
        // Mock fs
        fs.existsSync.mockReturnValue(false)
        fs.mkdirSync.mockImplementation(() => {})
        fs.promises = {
            writeFile: jest.fn().mockResolvedValue()
        }
        fs.readFileSync.mockReturnValue('{}')
        
        // Mock utilities
        utils.createSafeAnchor.mockImplementation(name => name.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
        utils.sanitizePackageName.mockImplementation(name => name.replace(/[^a-z0-9-]/g, '-'))
        utils.createMarkdownLink.mockImplementation((text, url) => `[${text}](${url})`)
        utils.createFileLink.mockImplementation((path, repo) => `[${path}](${repo}/tree/main/${path})`)
        utils.formatCategoryName.mockImplementation(cat => cat.charAt(0).toUpperCase() + cat.slice(1))
        
        // Mock navigation
        MainNavigation.generateMainNavigation.mockReturnValue('Main Navigation')
        MainNavigation.generateCompactNavigation.mockReturnValue('Compact Navigation')
        
        // Mock report generators
        MarkdownReporterIndex.generateIndexPage.mockReturnValue('Index Page Content')
        MarkdownReporterComponentsAnalysis.generateMainReport.mockReturnValue('Components Analysis Content')
        MarkdownReporterComponentFile.generateComponentFile.mockReturnValue('Component File Content')
        MarkdownReporterFeatures.generateFeaturesReport.mockReturnValue('Features Report Content')
        MarkdownReporterFeatureFile.generateFeatureFile.mockReturnValue('Feature File Content')
        MarkdownReporterHubOverviewReport.generateHubsOverviewReport.mockReturnValue('Hubs Overview Content')
        MarkdownReporterHubFile.generateHubFile.mockReturnValue('Hub File Content')
        MarkdownReporterFiles.generateImpactFiles.mockResolvedValue('Files Report Content')
        
        // Setup test data
        mockConfig = {
            outputDir: '/test/output',
            repoUrl: 'https://github.com/user/repo'
        }
        
        mockDetailedReport = {
            components: [
                {
                    name: 'Button',
                    package: '@mui/material',
                    totalUsages: 50,
                    fileCount: 10,
                    props: { unique: ['onClick', 'disabled', 'className'] }
                },
                {
                    name: 'Card',
                    package: '@mui/material',
                    totalUsages: 30,
                    fileCount: 5,
                    props: { unique: ['title'] }
                },
                {
                    name: 'Icon',
                    package: 'react-icons',
                    totalUsages: 20,
                    fileCount: 3,
                    props: { unique: [] }
                }
            ],
            files: []
        }
        
        mockIntersectionsReport = {
            globalImportHubByIntersection: {
                'src/features/Dashboard.js': {
                    name: 'Dashboard',
                    path: 'src/features/Dashboard.js',
                    imports: []
                }
            },
            globalImportHubs: {
                'src/hubs/MainHub.js': {
                    name: 'MainHub',
                    path: 'src/hubs/MainHub.js'
                }
            },
            hubCategories: {
                baseHubs: [],
                mainHubs: [{ path: 'src/hubs/MainHub.js' }],
                intermediateHubs: []
            },
            hubDependencies: {},
            hubUsage: {}
        }
        
        mockDependencyReport = {}
    })
    
    afterEach(() => {
        console.log.mockRestore()
        console.warn.mockRestore()
        console.error.mockRestore()
    })
    
    describe('generateMarkdownReport', () => {
        it('should generate all reports successfully', async () => {
            const result = await generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            expect(result).toEqual({
                success: true,
                message: 'Markdown report generated successfully'
            })
            
            // Verify directory structure created
            expect(fs.mkdirSync).toHaveBeenCalledWith(
                path.join('/test/output', 'components'),
                { recursive: true }
            )
            expect(fs.mkdirSync).toHaveBeenCalledWith(
                path.join('/test/output', 'features'),
                { recursive: true }
            )
            expect(fs.mkdirSync).toHaveBeenCalledWith(
                path.join('/test/output', 'hubs'),
                { recursive: true }
            )
            
            // Verify main reports generated
            expect(MarkdownReporterIndex.generateIndexPage).toHaveBeenCalled()
            expect(MarkdownReporterComponentsAnalysis.generateMainReport).toHaveBeenCalled()
            
            // Verify files written
            expect(fs.promises.writeFile).toHaveBeenCalledWith(
                path.join('/test/output', 'index.md'),
                'Index Page Content'
            )
            expect(fs.promises.writeFile).toHaveBeenCalledWith(
                path.join('/test/output', 'components.md'),
                'Components Analysis Content'
            )
        })
        
        it('should warn when no repository URL provided', async () => {
            const configNoRepo = { ...mockConfig, repoUrl: '' }
            
            await generateMarkdownReport({
                config: configNoRepo,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            expect(console.warn).toHaveBeenCalledWith(
                'No repository URL provided. File links will be disabled.'
            )
        })
        
        it('should skip component reports when no components', async () => {
            const emptyDetailedReport = { ...mockDetailedReport, components: [] }
            
            await generateMarkdownReport({
                config: mockConfig,
                detailedReport: emptyDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            expect(console.log).toHaveBeenCalledWith(
                'No components found to generate component files'
            )
            expect(MarkdownReporterComponentFile.generateComponentFile).not.toHaveBeenCalled()
        })
        
        it('should skip feature reports when no intersection data', async () => {
            const emptyIntersectionsReport = {}
            
            await generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: emptyIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            expect(MarkdownReporterFeatures.generateFeaturesReport).not.toHaveBeenCalled()
            expect(MarkdownReporterFeatureFile.generateFeatureFile).not.toHaveBeenCalled()
        })
        
        it('should generate component files grouped by package', async () => {
            await generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            // Verify package directories created
            expect(fs.mkdirSync).toHaveBeenCalledWith(
                path.join('/test/output', 'components', '-mui-material'),
                { recursive: true }
            )
            expect(fs.mkdirSync).toHaveBeenCalledWith(
                path.join('/test/output', 'components', 'react-icons'),
                { recursive: true }
            )
            
            // Verify component files generated
            expect(MarkdownReporterComponentFile.generateComponentFile).toHaveBeenCalledTimes(3)
            
            // Verify package index files generated
            expect(fs.promises.writeFile).toHaveBeenCalledWith(
                path.join('/test/output', 'components', '-mui-material', 'index.md'),
                expect.stringContaining('@mui/material Components')
            )
        })
        
        it('should generate hub reports when hub data exists', async () => {
            await generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            expect(MarkdownReporterHubFile.generateHubFile).toHaveBeenCalled()
            expect(MarkdownReporterHubOverviewReport.generateHubsOverviewReport).toHaveBeenCalled()
        })
        
        it('should handle errors gracefully', async () => {
            const error = new Error('Write failed')
            fs.promises.writeFile.mockRejectedValueOnce(error)
            
            await expect(generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })).rejects.toThrow('Write failed')
            
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Error generating markdown report')
            )
        })
        
        it('should handle component file generation errors', async () => {
            MarkdownReporterComponentFile.generateComponentFile.mockImplementationOnce(() => {
                throw new Error('Component generation failed')
            })
            
            await generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Error generating component file for Button')
            )
        })
        
        it('should calculate impact scores correctly', async () => {
            await generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            // Verify package index content includes impact scores
            const indexWriteCalls = fs.promises.writeFile.mock.calls.filter(
                call => call[0].includes('index.md') && call[0].includes('components')
            )
            
            expect(indexWriteCalls.length).toBeGreaterThan(0)
            indexWriteCalls.forEach(call => {
                expect(call[1]).toContain('Impact Score:')
            })
        })
        
        it('should filter out hubs from features', async () => {
            await generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            // Dashboard should be generated as a feature (not in hubCategories)
            expect(MarkdownReporterFeatureFile.generateFeatureFile).toHaveBeenCalledWith({
                config: mockConfig,
                feature: expect.objectContaining({ name: 'Dashboard' }),
                intersectionsReport: mockIntersectionsReport,
                detailedReport: mockDetailedReport
            })
        })
        
        it('should use existing directories', async () => {
            fs.existsSync.mockReturnValue(true)
            
            await generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            // Should not create directories that already exist
            expect(fs.mkdirSync).not.toHaveBeenCalledWith(
                path.join('/test/output', 'components'),
                { recursive: true }
            )
        })
    })
    
    describe('readJsonReport', () => {
        it('should read and parse JSON report successfully', async () => {
            const mockData = { test: 'data' }
            fs.readFileSync.mockReturnValue(JSON.stringify(mockData))
            
            const result = await readJsonReport('/test/output', 'test.json')
            
            expect(fs.readFileSync).toHaveBeenCalledWith(
                path.join('/test/output', 'data', 'test.json'),
                'utf8'
            )
            expect(result).toEqual(mockData)
        })
        
        it('should exit process on read error', async () => {
            const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
            fs.readFileSync.mockImplementation(() => {
                throw new Error('Read failed')
            })
            
            await readJsonReport('/test/output', 'test.json')
            
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Error reading JSON report test.json')
            )
            expect(mockExit).toHaveBeenCalledWith(1)
            
            mockExit.mockRestore()
        })
        
        it('should exit process on parse error', async () => {
            const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
            fs.readFileSync.mockReturnValue('invalid json')
            
            await readJsonReport('/test/output', 'test.json')
            
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Error reading JSON report test.json')
            )
            expect(mockExit).toHaveBeenCalledWith(1)
            
            mockExit.mockRestore()
        })
    })
    
    describe('package index generation', () => {
        it('should group components by impact level', async () => {
            await generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            const indexCalls = fs.promises.writeFile.mock.calls.filter(
                call => call[0].includes('index.md') && call[0].includes('components')
            )
            
            indexCalls.forEach(call => {
                const content = call[1]
                // At least one impact level section should be present
                const hasImpactSection = 
                    content.includes('High Impact Components') ||
                    content.includes('Medium Impact Components') ||
                    content.includes('Low Impact Components')
                expect(hasImpactSection).toBe(true)
            })
        })
        
        it('should include navigation in package index', async () => {
            await generateMarkdownReport({
                config: mockConfig,
                detailedReport: mockDetailedReport,
                intersectionsReport: mockIntersectionsReport,
                dependencyReport: mockDependencyReport
            })
            
            expect(MainNavigation.generateCompactNavigation).toHaveBeenCalledWith(
                '../../',
                'component'
            )
        })
    })
})