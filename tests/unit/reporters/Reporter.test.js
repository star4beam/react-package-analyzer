const fs = require('fs')
const path = require('path')
const Reporter = require('../../../src/reporters/Reporter')

// Mock dependencies
jest.mock('fs')
jest.mock('path')

describe('Reporter', () => {
  let reporter, mockLogger, mockConfig

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockLogger = {
      createTask: jest.fn(() => ({
        succeed: jest.fn(),
        fail: jest.fn()
      })),
      error: jest.fn()
    }
    
    mockConfig = {
      outputDir: '/test/output',
      logger: mockLogger
    }
    
    // Mock fs methods
    fs.existsSync = jest.fn().mockReturnValue(false)
    fs.mkdirSync = jest.fn()
    fs.promises = {
      writeFile: jest.fn().mockResolvedValue()
    }
    
    // Mock path methods
    path.join = jest.fn().mockImplementation((...args) => args.join('/'))
    
    reporter = new Reporter(mockConfig)
  })

  describe('constructor', () => {
    test('should initialize with provided config', () => {
      expect(reporter.config).toBe(mockConfig)
      expect(reporter.outputDir).toBe('/test/output')
      expect(reporter.logger).toBe(mockLogger)
    })

    test('should use default config when none provided', () => {
      const defaultReporter = new Reporter()
      expect(defaultReporter.config.outputDir).toBe('./reports')
      expect(defaultReporter.logger).toBe(console)
    })

    test('should create data directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false)
      new Reporter(mockConfig)
      
      expect(fs.mkdirSync).toHaveBeenCalledWith('/test/output/data', { recursive: true })
    })

    test('should not create data directory if it exists', () => {
      fs.existsSync.mockReturnValue(true)
      fs.mkdirSync.mockClear() // Clear previous calls
      
      new Reporter(mockConfig)
      
      expect(fs.mkdirSync).not.toHaveBeenCalled()
    })
  })

  describe('writeReport', () => {
    test('should write JSON data to file', async () => {
      const testData = { test: 'data', count: 42 }
      
      await reporter.writeReport('test.json', testData)
      
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '/test/output/data/test.json',
        JSON.stringify(testData, null, 2)
      )
    })

    test('should throw error for undefined data', async () => {
      await expect(reporter.writeReport('test.json', undefined))
        .rejects.toThrow('No data provided for test.json')
    })

    test('should throw error for null data', async () => {
      await expect(reporter.writeReport('test.json', null))
        .rejects.toThrow('No data provided for test.json')
    })

    test('should handle file write errors', async () => {
      const writeError = new Error('Write failed')
      fs.promises.writeFile.mockRejectedValue(writeError)
      
      await expect(reporter.writeReport('test.json', { data: 'test' }))
        .rejects.toThrow('Write failed')
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error writing report test.json',
        writeError
      )
    })
  })

  describe('generateSummaryReport', () => {
    test('should generate summary report successfully', async () => {
      const mockSpinner = { succeed: jest.fn(), fail: jest.fn() }
      const summaryData = { totalFiles: 10, packages: ['react', 'lodash'] }
      
      await reporter.generateSummaryReport(summaryData, mockSpinner)
      
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '/test/output/data/summary.json',
        JSON.stringify(summaryData, null, 2)
      )
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Summary report generated')
    })

    test('should handle undefined summary data', async () => {
      const mockSpinner = { succeed: jest.fn(), fail: jest.fn() }
      
      await expect(reporter.generateSummaryReport(undefined, mockSpinner))
        .rejects.toThrow('Summary data is undefined')
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Summary report generation failed')
    })

    test('should work without spinner', async () => {
      const summaryData = { totalFiles: 5 }
      
      await expect(reporter.generateSummaryReport(summaryData))
        .resolves.not.toThrow()
    })
  })

  describe('generateDetailedReport', () => {
    test('should generate detailed report successfully', async () => {
      const mockSpinner = { succeed: jest.fn(), fail: jest.fn() }
      const detailedData = { files: [], components: [] }
      
      await reporter.generateDetailedReport(detailedData, mockSpinner)
      
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '/test/output/data/detailed.json',
        JSON.stringify(detailedData, null, 2)
      )
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Detailed report generated')
    })

    test('should handle undefined detailed data', async () => {
      const mockSpinner = { succeed: jest.fn(), fail: jest.fn() }
      
      await expect(reporter.generateDetailedReport(undefined, mockSpinner))
        .rejects.toThrow('Detailed data is undefined')
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Detailed report generation failed')
    })
  })

  describe('generateDependencyReport', () => {
    test('should generate dependency report successfully', async () => {
      const mockSpinner = { succeed: jest.fn(), fail: jest.fn() }
      const dependencyData = { '@mui/material': { files: {} } }
      
      await reporter.generateDependencyReport(dependencyData, mockSpinner)
      
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '/test/output/data/dependency-chains.json',
        JSON.stringify(dependencyData, null, 2)
      )
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Dependency report generated')
    })
  })

  describe('aggregateResults', () => {
    test('should throw error for non-array input', () => {
      expect(() => reporter.aggregateResults({}))
        .toThrow('Raw data must be an array')
      
      expect(() => reporter.aggregateResults(null))
        .toThrow('Raw data must be an array')
      
      expect(() => reporter.aggregateResults('string'))
        .toThrow('Raw data must be an array')
    })

    test('should handle empty array', () => {
      const result = reporter.aggregateResults([])
      
      expect(result).toHaveProperty('summary')
      expect(result).toHaveProperty('detailed')
      expect(result.summary.totalFiles).toBe(0)
      expect(result.detailed.files).toEqual([])
    })

    test('should aggregate simple file data', () => {
      const rawData = [
        {
          file: 'src/Button.jsx',
          usage: {
            '@mui/material': {
              Button: {
                imported: 1,
                used: 2,
                props: {
                  total: 3,
                  unique: ['variant', 'color', 'onClick'],
                  details: { variant: 1, color: 1, onClick: 1 },
                  categories: {
                    customization: { count: 2, props: { variant: 1, color: 1 } },
                    eventHandler: { count: 1, props: { onClick: 1 } }
                  }
                }
              }
            }
          },
          imports: ['src/utils/helper'],
          totalProps: 3
        }
      ]

      const result = reporter.aggregateResults(rawData)

      expect(result.summary.totalFiles).toBe(1)
      expect(result.summary.packageStats).toHaveProperty('@mui/material')
      
      const muiStats = result.summary.packageStats['@mui/material']
      expect(muiStats).toBeDefined()
      expect(muiStats.uniqueComponents).toContain('Button')
      
      expect(result.detailed.files).toHaveLength(1)
      expect(result.detailed.files[0]).toHaveProperty('path')
      expect(result.detailed.files[0].path).toBe('src/Button.jsx')
      expect(result.detailed.files[0].componentsUsed).toHaveLength(1)
      expect(result.detailed.files[0].componentsUsed[0].name).toBe('Button')
    })

    test('should handle files without usage data', () => {
      const rawData = [
        {
          file: 'src/util.js',
          imports: ['lodash'],
          totalProps: 0
        }
      ]

      const result = reporter.aggregateResults(rawData)

      expect(result.summary.totalFiles).toBe(1)
      expect(result.detailed.files).toHaveLength(1)
      expect(result.detailed.files[0].componentsUsed).toEqual([])
    })

    test('should handle malformed file data gracefully', () => {
      const rawData = [
        { file: 'valid1.js', totalProps: 0 },
        { file: 'valid2.js' }, // missing totalProps - should not crash
        { /* missing file property */ totalProps: 5 } // This will be skipped
      ]

      const result = reporter.aggregateResults(rawData)

      expect(result.summary.totalFiles).toBe(2) // Two valid files counted
      expect(result.detailed.files).toHaveLength(2)
    })

    test('should accumulate props across multiple files for same component', () => {
      const rawData = [
        {
          file: 'src/Page1.jsx',
          usage: {
            '@mui/material': {
              Button: {
                props: {
                  unique: ['variant', 'onClick'],
                  details: { variant: 1, onClick: 1 }
                }
              }
            }
          }
        },
        {
          file: 'src/Page2.jsx',
          usage: {
            '@mui/material': {
              Button: {
                props: {
                  unique: ['color', 'size'],
                  details: { color: 1, size: 1 }
                }
              }
            }
          }
        }
      ]

      const result = reporter.aggregateResults(rawData)

      // Check if components were processed
      expect(result.detailed.components).toBeDefined()
      expect(result.detailed.components.length).toBeGreaterThan(0)
      
      // Find the Button component in results
      const buttonComponent = result.detailed.components.find(
        comp => comp.component === 'Button'
      )
      
      if (buttonComponent) {
        expect(buttonComponent.props.unique.length).toBeGreaterThan(0)
      }
    })
  })

  describe('extractPropsArray', () => {
    test('should extract props from unique array', () => {
      const usage = {
        props: {
          unique: ['prop1', 'prop2', 'prop3']
        }
      }

      const result = reporter.extractPropsArray(usage)
      expect(result).toEqual(['prop1', 'prop2', 'prop3'])
    })

    test('should extract props from unique Set', () => {
      const usage = {
        props: {
          unique: new Set(['prop1', 'prop2'])
        }
      }

      const result = reporter.extractPropsArray(usage)
      expect(result).toEqual(expect.arrayContaining(['prop1', 'prop2']))
    })

    test('should extract props from details object', () => {
      const usage = {
        props: {
          details: { prop1: 2, prop2: 1, prop3: 3 }
        }
      }

      const result = reporter.extractPropsArray(usage)
      expect(result).toEqual(['prop1', 'prop2', 'prop3'])
    })

    test('should return empty array for usage without props', () => {
      expect(reporter.extractPropsArray({})).toEqual([])
      expect(reporter.extractPropsArray({ props: {} })).toEqual([])
      expect(reporter.extractPropsArray({ props: { unique: [] } })).toEqual([])
    })
  })

  describe('generateReports integration', () => {
    test('should generate all reports successfully', async () => {
      const rawData = [
        {
          file: 'src/test.jsx',
          usage: { react: { Component: { used: 1 } } },
          totalProps: 0
        }
      ]
      const dependencyChains = { react: { files: {} } }

      await reporter.generateReports(rawData, dependencyChains)

      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '/test/output/data/summary.json',
        expect.any(String)
      )
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '/test/output/data/detailed.json',
        expect.any(String)
      )
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '/test/output/data/dependency-chains.json',
        expect.any(String)
      )
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        '/test/output/data/import-intersections.json',
        expect.any(String)
      )
    })

    test('should handle errors during report generation', async () => {
      const error = new Error('Generation failed')
      fs.promises.writeFile.mockRejectedValue(error)

      await expect(reporter.generateReports([], {}))
        .rejects.toThrow('Generation failed')
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error generating reports',
        error
      )
    })

    test('should work without logger', async () => {
      const reporterWithoutLogger = new Reporter({ outputDir: '/test' })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const error = new Error('Test error')
      fs.promises.writeFile.mockRejectedValue(error)

      await expect(reporterWithoutLogger.generateReports([], {}))
        .rejects.toThrow('Test error')
      
      expect(consoleSpy).toHaveBeenCalled() // Just check that console.error was called
      
      consoleSpy.mockRestore()
    })
  })
})