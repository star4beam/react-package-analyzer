const fs = require('fs')
const path = require('path')
const ImportAnalyzerConfig = require('../../../src/config/Config')

// Mock dependencies
jest.mock('cosmiconfig', () => ({
  cosmiconfigSync: jest.fn()
}))

jest.mock('fs')
jest.mock('path')

describe('ImportAnalyzerConfig', () => {
  let consoleLogSpy, consoleWarnSpy
  
  beforeEach(() => {
    jest.clearAllMocks()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    
    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue('/test/cwd')
    
    // Default path.resolve behavior
    path.resolve.mockImplementation((base, relative) => {
      if (relative) {
        return `${base}/${relative}`
      }
      return base
    })
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    process.cwd.mockRestore()
  })

  describe('constructor', () => {
    test('should create config with default options', () => {
      fs.existsSync.mockReturnValue(false)
      
      const config = new ImportAnalyzerConfig()
      
      expect(config.packagesToTrack).toBeInstanceOf(Array)
      expect(config.packagesToTrack.length).toBe(0)
      expect(config.aliasMap).toEqual({})
      expect(config.tempFilePath).toBe('temp_import_analysis.jsonl')
      expect(config.reportFilePath).toBe('import_analysis_report.json')
    })

    test('should create config with custom options', () => {
      const options = {
        packagesToTrack: ['react', 'lodash'],
        aliasMap: { '@': 'src' },
        tempFilePath: 'custom-temp.jsonl',
        reportFilePath: 'custom-report.json',
        include: '**/*.jsx',
        exclude: '**/node_modules/**'
      }
      
      const config = new ImportAnalyzerConfig(options)
      
      expect(config.packagesToTrack).toEqual(['react', 'lodash'])
      expect(config.aliasMap).toEqual({ '@': 'src' })
      expect(config.tempFilePath).toBe('custom-temp.jsonl')
      expect(config.reportFilePath).toBe('custom-report.json')
      expect(config.include).toBe('**/*.jsx')
      expect(config.exclude).toBe('**/node_modules/**')
    })

    test('should not reload aliases if aliasMap is provided', () => {
      const config = new ImportAnalyzerConfig({ aliasMap: { '@': 'src' } })
      
      expect(config.aliasMap).toEqual({ '@': 'src' })
      expect(fs.existsSync).not.toHaveBeenCalled()
    })
  })

  describe('loadAliasesFromConfig', () => {
    test('should load aliases from jsconfig.json', () => {
      const mockJsconfig = {
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['src/*']
          }
        }
      }

      fs.existsSync.mockImplementation((filePath) => {
        return filePath.endsWith('jsconfig.json')
      })
      fs.readFileSync.mockReturnValue(JSON.stringify(mockJsconfig))

      const config = new ImportAnalyzerConfig({ aliasMap: { existing: 'alias' } })
      const aliases = config.loadAliasesFromConfig()
      
      expect(aliases).toHaveProperty('@')
      expect(aliases['@']).toContain('src')
      expect(consoleLogSpy).toHaveBeenCalledWith('Loaded path aliases from jsconfig.json')
    })

    test('should load aliases from tsconfig.json if jsconfig not found', () => {
      const mockTsconfig = {
        compilerOptions: {
          baseUrl: 'src',
          paths: {
            '~/*': ['components/*']
          }
        }
      }

      fs.existsSync.mockImplementation((filePath) => {
        return filePath.endsWith('tsconfig.json')
      })
      fs.readFileSync.mockReturnValue(JSON.stringify(mockTsconfig))

      const config = new ImportAnalyzerConfig({ aliasMap: { existing: 'alias' } })
      const aliases = config.loadAliasesFromConfig()
      
      expect(aliases).toHaveProperty('~')
      expect(aliases['~']).toContain('components')
      expect(consoleLogSpy).toHaveBeenCalledWith('Loaded path aliases from tsconfig.json')
    })

    test('should handle JSON parse errors gracefully', () => {
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue('invalid json')

      const config = new ImportAnalyzerConfig({ aliasMap: { existing: 'alias' } })
      const aliases = config.loadAliasesFromConfig()
      
      expect(aliases).toEqual({})
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error loading config files directly:', 
        expect.any(String)
      )
    })

    test('should fallback to cosmiconfig on direct loading failure', () => {
      const { cosmiconfigSync } = require('cosmiconfig')
      const mockExplorer = {
        search: jest.fn().mockReturnValue({
          config: {
            compilerOptions: {
              paths: { '@/*': ['src/*'] }
            }
          }
        })
      }
      
      cosmiconfigSync.mockReturnValue(mockExplorer)
      fs.existsSync.mockReturnValue(false)

      const config = new ImportAnalyzerConfig({ aliasMap: { existing: 'alias' } })
      const aliases = config.loadAliasesFromConfig()
      
      expect(cosmiconfigSync).toHaveBeenCalledWith('jsconfig')
      expect(aliases).toHaveProperty('@')
      expect(consoleLogSpy).toHaveBeenCalledWith('Loaded path aliases from jsconfig using cosmiconfig')
    })

    test('should try tsconfig via cosmiconfig if jsconfig fails', () => {
      const { cosmiconfigSync } = require('cosmiconfig')
      const mockJsconfigExplorer = {
        search: jest.fn().mockReturnValue(null)
      }
      const mockTsconfigExplorer = {
        search: jest.fn().mockReturnValue({
          config: {
            compilerOptions: {
              paths: { '~/*': ['components/*'] }
            }
          }
        })
      }
      
      cosmiconfigSync
        .mockReturnValueOnce(mockJsconfigExplorer)
        .mockReturnValueOnce(mockTsconfigExplorer)
      
      fs.existsSync.mockReturnValue(false)

      const config = new ImportAnalyzerConfig({ aliasMap: { existing: 'alias' } })
      const aliases = config.loadAliasesFromConfig()
      
      expect(cosmiconfigSync).toHaveBeenCalledWith('jsconfig')
      expect(cosmiconfigSync).toHaveBeenCalledWith('tsconfig')
      expect(aliases).toHaveProperty('~')
      expect(consoleLogSpy).toHaveBeenCalledWith('Loaded path aliases from tsconfig using cosmiconfig')
    })

    test('should handle cosmiconfig errors gracefully', () => {
      const { cosmiconfigSync } = require('cosmiconfig')
      cosmiconfigSync.mockImplementation(() => {
        throw new Error('Cosmiconfig error')
      })
      
      fs.existsSync.mockReturnValue(false)

      const config = new ImportAnalyzerConfig({ aliasMap: { existing: 'alias' } })
      const aliases = config.loadAliasesFromConfig()
      
      expect(aliases).toEqual({})
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Could not load path aliases from config files using cosmiconfig:', 
        'Cosmiconfig error'
      )
    })
  })

  describe('parseConfigPaths', () => {
    test('should parse paths with wildcards correctly', () => {
      const config = new ImportAnalyzerConfig({ aliasMap: { '@': 'src' } })
      
      const mockConfig = {
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['src/*'],
            '~/*': ['components/*'],
            'utils': ['src/utils']
          }
        }
      }

      const aliases = config.parseConfigPaths(mockConfig)
      
      expect(aliases).toHaveProperty('@')
      expect(aliases).toHaveProperty('~')
      expect(aliases).toHaveProperty('utils')
      expect(aliases['@']).toContain('src')
      expect(aliases['~']).toContain('components')
      expect(aliases['utils']).toContain('utils')
    })

    test('should handle config without compilerOptions', () => {
      const config = new ImportAnalyzerConfig({ aliasMap: { '@': 'src' } })
      
      const aliases = config.parseConfigPaths({})
      expect(aliases).toEqual({})
      
      const aliasesNull = config.parseConfigPaths(null)
      expect(aliasesNull).toEqual({})
    })

    test('should handle config without paths', () => {
      const config = new ImportAnalyzerConfig({ aliasMap: { '@': 'src' } })
      
      const mockConfig = {
        compilerOptions: {
          baseUrl: '.'
        }
      }

      const aliases = config.parseConfigPaths(mockConfig)
      expect(aliases).toEqual({})
    })

    test('should handle empty path arrays', () => {
      const config = new ImportAnalyzerConfig({ aliasMap: { '@': 'src' } })
      
      const mockConfig = {
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': [],
            '~/*': ['components/*']
          }
        }
      }

      const aliases = config.parseConfigPaths(mockConfig)
      
      expect(aliases).not.toHaveProperty('@')
      expect(aliases).toHaveProperty('~')
      expect(aliases['~']).toContain('components')
    })

    test('should use default baseUrl if not provided', () => {
      const config = new ImportAnalyzerConfig({ aliasMap: { '@': 'src' } })
      
      const mockConfig = {
        compilerOptions: {
          paths: {
            '@/*': ['src/*']
          }
        }
      }

      const aliases = config.parseConfigPaths(mockConfig)
      
      expect(aliases).toHaveProperty('@')
      expect(aliases['@']).toContain('src')
    })

    test('should log alias mappings', () => {
      const config = new ImportAnalyzerConfig({ aliasMap: { '@': 'src' } })
      
      const mockConfig = {
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['src/*']
          }
        }
      }

      config.parseConfigPaths(mockConfig)
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Mapped alias "@" to'))
    })
  })
})