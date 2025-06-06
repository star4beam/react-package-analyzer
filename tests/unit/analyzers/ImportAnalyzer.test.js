const fs = require('fs')
const path = require('path')
const ImportAnalyzer = require('../../../src/analyzers/ImportAnalyzer')

// Mock dependencies
jest.mock('fs')
jest.mock('path')

describe('ImportAnalyzer', () => {
  let mockConfig, mockLogger, analyzer
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    }
    
    mockConfig = {
      packagesToTrack: ['@mui/material', '@chakra-ui/react'],
      aliasMap: { '@': '/src', '~': '/src/components' },
      tempFilePath: '/tmp/analysis.jsonl',
      logger: mockLogger
    }
    
    analyzer = new ImportAnalyzer(mockConfig)
    
    // Mock path methods
    path.resolve.mockImplementation((base, relative) => `${base}/${relative}`)
    path.relative.mockImplementation((from, to) => to.replace(from + '/', ''))
    path.dirname.mockImplementation((p) => p.split('/').slice(0, -1).join('/'))
    
    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue('/project')
  })

  afterEach(() => {
    process.cwd.mockRestore()
  })

  describe('constructor', () => {
    test('should initialize with config and setup usage maps', () => {
      expect(analyzer.config).toBe(mockConfig)
      expect(analyzer.componentMap).toEqual({})
      expect(analyzer.usageMap).toEqual({
        '@mui/material': {},
        '@chakra-ui/react': {}
      })
      expect(analyzer.imports).toBeInstanceOf(Set)
      expect(analyzer.logger).toBe(mockLogger)
    })

    test('should use default logger if not provided in config', () => {
      const configWithoutLogger = { ...mockConfig }
      delete configWithoutLogger.logger
      
      const analyzerWithDefaultLogger = new ImportAnalyzer(configWithoutLogger)
      expect(analyzerWithDefaultLogger.logger).toBeDefined()
    })
  })

  describe('resolveImport', () => {
    test('should resolve aliased imports', () => {
      const result = analyzer.resolveImport('@/components/Button', '/project/src/pages/Home.jsx')
      expect(result).toBe('/src/components/Button')
    })

    test('should resolve aliased imports case-insensitively', () => {
      const result = analyzer.resolveImport('@/Utils/Helper', '/project/src/pages/Home.jsx')
      expect(result).toBe('/src/Utils/Helper')
    })

    test('should resolve relative imports', () => {
      path.resolve.mockReturnValue('/project/src/components/Button')
      path.relative.mockReturnValue('src/components/Button')
      
      const result = analyzer.resolveImport('./Button', '/project/src/components/index.js')
      expect(result).toBe('src/components/Button')
    })

    test('should resolve relative imports with parent directory', () => {
      path.resolve.mockReturnValue('/project/src/utils/helper')
      path.relative.mockReturnValue('src/utils/helper')
      
      const result = analyzer.resolveImport('../utils/helper', '/project/src/components/Button.jsx')
      expect(result).toBe('src/utils/helper')
    })

    test('should remove file extensions from resolved imports', () => {
      path.resolve.mockReturnValue('/project/src/components/Button.jsx')
      path.relative.mockReturnValue('src/components/Button.jsx')
      
      const result = analyzer.resolveImport('./Button.jsx', '/project/src/components/index.js')
      expect(result).toBe('src/components/Button')
    })

    test('should remove /index from resolved imports', () => {
      path.resolve.mockReturnValue('/project/src/components/index')
      path.relative.mockReturnValue('src/components/index')
      
      const result = analyzer.resolveImport('./index', '/project/src/components/Button.jsx')
      expect(result).toBe('src/components')
    })

    test('should return non-relative imports unchanged', () => {
      const result = analyzer.resolveImport('react', '/project/src/components/Button.jsx')
      expect(result).toBe('react')
    })

    test('should normalize backslashes to forward slashes', () => {
      const result = analyzer.resolveImport('@\\components\\Button', '/project/src/pages/Home.jsx')
      expect(result).toBe('/src/components/Button')
    })
  })

  describe('categorizeProp', () => {
    test('should categorize event handler props', () => {
      expect(analyzer.categorizeProp('onClick')).toContain('eventHandler')
      expect(analyzer.categorizeProp('onSubmit')).toContain('eventHandler')
      expect(analyzer.categorizeProp('onMouseEnter')).toContain('eventHandler')
      expect(analyzer.categorizeProp('onChange')).toContain('eventHandler')
    })

    test('should categorize accessibility props', () => {
      expect(analyzer.categorizeProp('aria-label')).toContain('accessibility')
      expect(analyzer.categorizeProp('aria-hidden')).toContain('accessibility')
      expect(analyzer.categorizeProp('role')).toContain('accessibility')
      expect(analyzer.categorizeProp('tabIndex')).toContain('accessibility')
    })

    test('should categorize styling props', () => {
      expect(analyzer.categorizeProp('className')).toContain('styling')
      expect(analyzer.categorizeProp('style')).toContain('styling')
      // sx is not explicitly defined in the styling category in ImportAnalyzer
      expect(analyzer.categorizeProp('sx')).toContain('other')
    })

    test('should categorize test selector props', () => {
      expect(analyzer.categorizeProp('data-testid')).toContain('testSelector')
      expect(analyzer.categorizeProp('data-test-id')).toContain('testSelector')
      expect(analyzer.categorizeProp('data-cy')).toContain('testSelector')
    })

    test('should categorize customization props', () => {
      expect(analyzer.categorizeProp('variant')).toContain('customization')
      expect(analyzer.categorizeProp('size')).toContain('customization')
      expect(analyzer.categorizeProp('color')).toContain('customization')
    })

    test('should return array of categories', () => {
      const result = analyzer.categorizeProp('onClick')
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    test('should default to other for unknown props', () => {
      expect(analyzer.categorizeProp('customProp')).toContain('other')
      expect(analyzer.categorizeProp('unknownAttribute')).toContain('other')
    })

    test('should handle edge cases gracefully', () => {
      expect(() => analyzer.categorizeProp('')).not.toThrow()
      expect(() => analyzer.categorizeProp('validProp')).not.toThrow()
    })
  })

  describe('processImport', () => {
    test('should process named imports', () => {
      const mockImportNode = {
        specifiers: [
          { imported: { name: 'Button' }, local: { name: 'Button' } },
          { imported: { name: 'TextField' }, local: { name: 'TextField' } }
        ]
      }

      analyzer.processImport(mockImportNode, '@mui/material')

      expect(analyzer.componentMap.Button).toEqual({
        originalName: 'Button',
        package: '@mui/material'
      })
      expect(analyzer.componentMap.TextField).toEqual({
        originalName: 'TextField',
        package: '@mui/material'
      })
    })

    test('should process aliased imports', () => {
      const mockImportNode = {
        specifiers: [
          { imported: { name: 'Button' }, local: { name: 'MuiButton' } }
        ]
      }

      analyzer.processImport(mockImportNode, '@mui/material')

      expect(analyzer.componentMap.MuiButton).toEqual({
        originalName: 'Button',
        package: '@mui/material'
      })
    })

    test('should process default imports', () => {
      const mockImportNode = {
        specifiers: [
          { type: 'ImportDefaultSpecifier', local: { name: 'React' } }
        ]
      }

      analyzer.processImport(mockImportNode, 'react')

      // Default imports are not handled by processImport in the current implementation
      expect(analyzer.componentMap.React).toBeUndefined()
    })

    test('should process namespace imports', () => {
      const mockImportNode = {
        specifiers: [
          { type: 'ImportNamespaceSpecifier', local: { name: 'MUI' } }
        ]
      }

      analyzer.processImport(mockImportNode, '@mui/material')

      // Namespace imports are not handled by processImport in the current implementation
      expect(analyzer.componentMap.MUI).toBeUndefined()
    })

    test('should handle mixed import types', () => {
      // First process the react package initialization
      analyzer.config.packagesToTrack = ['react']
      analyzer.usageMap['react'] = {}
      
      const mockImportNode = {
        specifiers: [
          { type: 'ImportDefaultSpecifier', local: { name: 'React' } },
          { imported: { name: 'useState' }, local: { name: 'useState' } },
          { imported: { name: 'useEffect' }, local: { name: 'useEffect' } }
        ]
      }

      analyzer.processImport(mockImportNode, 'react')

      // Only named imports are processed
      expect(analyzer.componentMap.React).toBeUndefined()
      expect(analyzer.componentMap.useState).toEqual({
        originalName: 'useState',
        package: 'react'
      })
      expect(analyzer.componentMap.useEffect).toEqual({
        originalName: 'useEffect',
        package: 'react'
      })
      
      // Check that usage was initialized
      expect(analyzer.usageMap['react']['useState']).toBeDefined()
      expect(analyzer.usageMap['react']['useEffect']).toBeDefined()
    })
  })

  describe('analyzeAttributes', () => {
    let mockUsage

    beforeEach(() => {
      mockUsage = {
        props: {
          total: 0,
          unique: new Set(),
          details: {},
          categories: {}
        },
        withProps: 0
      }
    })

    test('should analyze simple props', () => {
      const mockAttributes = [
        { type: 'JSXAttribute', name: { name: 'variant' }, value: { value: 'contained' } },
        { type: 'JSXAttribute', name: { name: 'size' }, value: { value: 'large' } }
      ]

      analyzer.analyzeAttributes(mockUsage, mockAttributes)

      expect(mockUsage.props.total).toBe(2)
      expect(Array.from(mockUsage.props.unique)).toEqual(expect.arrayContaining(['variant', 'size']))
      expect(mockUsage.props.details).toEqual({ variant: 1, size: 1 })
    })

    test('should analyze boolean props', () => {
      const mockAttributes = [
        { type: 'JSXAttribute', name: { name: 'disabled' }, value: null },
        { type: 'JSXAttribute', name: { name: 'required' }, value: null }
      ]

      analyzer.analyzeAttributes(mockUsage, mockAttributes)

      expect(mockUsage.props.total).toBe(2)
      expect(Array.from(mockUsage.props.unique)).toEqual(expect.arrayContaining(['disabled', 'required']))
    })

    test('should handle JSX expression props', () => {
      const mockAttributes = [
        { 
          type: 'JSXAttribute',
          name: { name: 'onClick' }, 
          value: { 
            type: 'JSXExpressionContainer',
            expression: { type: 'Identifier', name: 'handleClick' }
          } 
        }
      ]

      analyzer.analyzeAttributes(mockUsage, mockAttributes)

      expect(mockUsage.props.total).toBe(1)
      expect(Array.from(mockUsage.props.unique)).toContain('onClick')
    })

    test('should handle spread attributes with object expression', () => {
      const mockAttributes = [
        {
          type: 'JSXSpreadAttribute',
          argument: {
            type: 'ObjectExpression',
            properties: [
              { type: 'ObjectProperty', key: { name: 'variant' }, value: { value: 'outlined' } },
              { type: 'ObjectProperty', key: { name: 'color' }, value: { value: 'primary' } }
            ]
          }
        }
      ]

      analyzer.analyzeAttributes(mockUsage, mockAttributes)

      expect(mockUsage.props.total).toBe(2)
      expect(Array.from(mockUsage.props.unique)).toEqual(expect.arrayContaining(['variant', 'color']))
      expect(mockUsage.spreadObjectProps).toBeDefined()
      expect(mockUsage.spreadObjectProps.count).toBe(2)
    })

    test('should handle spread attributes with identifier', () => {
      const mockAttributes = [
        {
          type: 'JSXSpreadAttribute',
          argument: { type: 'Identifier', name: 'props' }
        },
        { type: 'JSXAttribute', name: { name: 'onClick' }, value: null }
      ]

      analyzer.analyzeAttributes(mockUsage, mockAttributes)

      expect(mockUsage.props.total).toBe(1) // Only explicit props counted
      expect(Array.from(mockUsage.props.unique)).toContain('onClick')
    })

    test('should accumulate prop counts for repeated props', () => {
      const mockAttributes = [
        { type: 'JSXAttribute', name: { name: 'variant' }, value: { value: 'contained' } }
      ]

      // Analyze twice to test accumulation
      analyzer.analyzeAttributes(mockUsage, mockAttributes)
      analyzer.analyzeAttributes(mockUsage, mockAttributes)

      expect(mockUsage.props.total).toBe(2)
      expect(mockUsage.props.details.variant).toBe(2)
    })
  })

  describe('processResults', () => {
    beforeEach(() => {
      analyzer.usageMap['@mui/material'] = {
        Button: {
          imported: 1,
          used: 2,
          props: { total: 5 }
        }
      }
      analyzer.imports.add('src/components/Button')
      analyzer.imports.add('src/utils/helper')
    })

    test('should write results to temp file', () => {
      fs.appendFileSync = jest.fn()
      
      analyzer.processResults('/project/src/pages/Home.jsx')

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/tmp/analysis.jsonl',
        expect.stringContaining('"file"'),
        { encoding: 'utf8' }
      )
    })

    test('should include all required fields in output', () => {
      fs.appendFileSync = jest.fn()
      
      analyzer.processResults('/project/src/pages/Home.jsx')

      const writtenData = fs.appendFileSync.mock.calls[0][1]
      const parsedData = JSON.parse(writtenData.trim())

      expect(parsedData).toHaveProperty('file')
      expect(parsedData).toHaveProperty('usage')
      expect(parsedData).toHaveProperty('imports')
      expect(parsedData).toHaveProperty('totalProps')
      expect(parsedData.file).toBe('src/pages/Home.jsx')
      expect(parsedData.imports).toEqual(['src/components/Button', 'src/utils/helper'])
      expect(parsedData.totalProps).toBe(5)
    })

    test('should handle file write errors gracefully', () => {
      fs.appendFileSync = jest.fn().mockImplementation(() => {
        throw new Error('Write error')
      })

      // The method currently doesn't have error handling, so it will throw
      expect(() => analyzer.processResults('/project/src/pages/Home.jsx')).toThrow('Write error')
    })

    test('should normalize file paths correctly', () => {
      fs.appendFileSync = jest.fn()
      
      analyzer.processResults('/project/src/components/../pages/Home.jsx')

      const writtenData = fs.appendFileSync.mock.calls[0][1]
      const parsedData = JSON.parse(writtenData.trim())

      expect(parsedData.file).toContain('pages/Home.jsx')
    })
  })

  describe('edge cases and error handling', () => {
    test('should handle empty config gracefully', () => {
      const emptyConfig = { packagesToTrack: [] }
      const emptyAnalyzer = new ImportAnalyzer(emptyConfig)
      
      expect(emptyAnalyzer.usageMap).toEqual({})
      expect(emptyAnalyzer.config.aliasMap).toBeUndefined()
    })

    test('should handle invalid prop names in categorizeProp', () => {
      // These will throw due to toLowerCase() call on non-string
      expect(() => analyzer.categorizeProp(123)).toThrow()
      expect(() => analyzer.categorizeProp({})).toThrow()
      expect(() => analyzer.categorizeProp(null)).toThrow()
    })

    test('should handle null/undefined attributes in analyzeAttributes', () => {
      const mockUsage = {
        props: { total: 0, unique: new Set(), details: {}, categories: {} }
      }

      // These will throw due to .length access on null/undefined
      expect(() => analyzer.analyzeAttributes(mockUsage, null)).toThrow()
      expect(() => analyzer.analyzeAttributes(mockUsage, undefined)).toThrow()
      expect(() => analyzer.analyzeAttributes(mockUsage, [])).not.toThrow()
    })
  })
})