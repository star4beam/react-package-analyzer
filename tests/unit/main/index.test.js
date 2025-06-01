const { createTransform, ImportAnalyzerConfig, ImportAnalyzer } = require('../../../src/index')

// Mock dependencies
jest.mock('../../../src/config/Config')
jest.mock('../../../src/analyzers/ImportAnalyzer')

describe('index.js', () => {
  let mockConfig, mockAnalyzer, mockApi, mockFileInfo

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockConfig = {
      packagesToTrack: ['react'],
      aliasMap: {}
    }
    
    mockAnalyzer = {
      analyzeFile: jest.fn().mockReturnValue('analyzed result')
    }
    
    ImportAnalyzerConfig.mockImplementation(() => mockConfig)
    ImportAnalyzer.mockImplementation(() => mockAnalyzer)
    
    mockApi = {
      jscodeshift: {
        withParser: jest.fn().mockReturnValue('configured jscodeshift')
      }
    }
    
    mockFileInfo = {
      path: 'src/components/Button.jsx',
      source: 'original source code'
    }
  })

  describe('createTransform', () => {
    test('should create transform function', () => {
      const transform = createTransform()
      expect(typeof transform).toBe('function')
    })

    test('should create config with provided options', () => {
      const options = { packagesToTrack: ['@mui/material'] }
      createTransform(options)
      
      expect(ImportAnalyzerConfig).toHaveBeenCalledWith(options)
    })

    test('should create config with default options', () => {
      createTransform()
      
      expect(ImportAnalyzerConfig).toHaveBeenCalledWith({})
    })

    test('should configure parser for JavaScript files', () => {
      const transform = createTransform()
      mockFileInfo.path = 'src/components/Button.jsx'
      
      transform(mockFileInfo, mockApi)
      
      expect(mockApi.jscodeshift.withParser).toHaveBeenCalledWith('babel', {
        sourceType: 'module',
        plugins: expect.arrayContaining(['jsx', 'classProperties', 'dynamicImport']),
        tokens: true,
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true
      })
      
      // Should not include typescript plugin for JS files
      const [, config] = mockApi.jscodeshift.withParser.mock.calls[0]
      expect(config.plugins).not.toContain('typescript')
    })

    test('should configure parser for TypeScript files', () => {
      const transform = createTransform()
      mockFileInfo.path = 'src/components/Button.tsx'
      
      transform(mockFileInfo, mockApi)
      
      const [, config] = mockApi.jscodeshift.withParser.mock.calls[0]
      expect(config.plugins).toContain('typescript')
    })

    test('should detect TypeScript files by extension', () => {
      const transform = createTransform()
      
      // Test .ts extension
      mockFileInfo.path = 'src/utils/helper.ts'
      transform(mockFileInfo, mockApi)
      let [, config] = mockApi.jscodeshift.withParser.mock.calls[0]
      expect(config.plugins).toContain('typescript')
      
      // Test .tsx extension
      mockApi.jscodeshift.withParser.mockClear()
      mockFileInfo.path = 'src/components/Component.tsx'
      transform(mockFileInfo, mockApi)
      ;[, config] = mockApi.jscodeshift.withParser.mock.calls[0]
      expect(config.plugins).toContain('typescript')
    })

    test('should handle case-insensitive file extensions', () => {
      const transform = createTransform()
      mockFileInfo.path = 'src/components/Button.JSX'
      
      transform(mockFileInfo, mockApi)
      
      const [, config] = mockApi.jscodeshift.withParser.mock.calls[0]
      expect(config.plugins).toContain('jsx')
      expect(config.plugins).not.toContain('typescript')
    })

    test('should create analyzer with config', () => {
      const transform = createTransform()
      transform(mockFileInfo, mockApi)
      
      expect(ImportAnalyzer).toHaveBeenCalledWith(mockConfig)
    })

    test('should call analyzer.analyzeFile with correct parameters', () => {
      const transform = createTransform()
      const result = transform(mockFileInfo, mockApi)
      
      expect(mockAnalyzer.analyzeFile).toHaveBeenCalledWith(
        mockFileInfo,
        { jscodeshift: 'configured jscodeshift' }
      )
      expect(result).toBe('analyzed result')
    })

    test('should handle errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAnalyzer.analyzeFile.mockImplementation(() => {
        throw new Error('Analysis failed')
      })
      
      const transform = createTransform()
      const result = transform(mockFileInfo, mockApi)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error processing file src/components/Button.jsx: Analysis failed'
      )
      expect(result).toBe('original source code')
      
      consoleSpy.mockRestore()
    })

    test('should include all necessary parser plugins', () => {
      const transform = createTransform()
      transform(mockFileInfo, mockApi)
      
      const [, config] = mockApi.jscodeshift.withParser.mock.calls[0]
      const requiredPlugins = [
        'jsx',
        'classProperties',
        'decorators-legacy',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'dynamicImport',
        'nullishCoalescingOperator',
        'objectRestSpread',
        'optionalChaining',
        'asyncGenerators',
        'bigInt',
        'classPrivateProperties',
        'classPrivateMethods',
        'importMeta',
        'numericSeparator',
        'optionalCatchBinding',
        'topLevelAwait'
      ]
      
      requiredPlugins.forEach(plugin => {
        expect(config.plugins).toContain(plugin)
      })
    })
  })

  describe('exports', () => {
    test('should export createTransform function', () => {
      expect(typeof createTransform).toBe('function')
    })

    test('should export ImportAnalyzerConfig class', () => {
      expect(ImportAnalyzerConfig).toBeDefined()
    })

    test('should export ImportAnalyzer class', () => {
      expect(ImportAnalyzer).toBeDefined()
    })
  })
})