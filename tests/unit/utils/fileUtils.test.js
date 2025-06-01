const fs = require('fs')
const path = require('path')
const { normalizePath, findActualFile, rimrafSync, ensureDirectory } = require('../../../src/utils/fileUtils')

describe('fileUtils', () => {
  describe('normalizePath', () => {
    test('should handle alias resolution', () => {
      const aliasMap = { '@': 'src', '~': 'src/components' }
      const currentFile = 'src/components/Button.jsx'
      
      expect(normalizePath('@/utils/helper', currentFile, aliasMap)).toBe('src/utils/helper')
      expect(normalizePath('~/Card', currentFile, aliasMap)).toBe('src/components/Card')
      expect(normalizePath('@/config/settings', currentFile, aliasMap)).toBe('src/config/settings')
    })

    test('should handle case-insensitive alias matching', () => {
      const aliasMap = { '@': 'src' }
      const currentFile = 'src/components/Button.jsx'
      
      expect(normalizePath('@/Utils/Helper', currentFile, aliasMap)).toBe('src/Utils/Helper')
    })

    test('should remove file extensions', () => {
      const currentFile = 'src/components/Button.jsx'
      
      expect(normalizePath('./Card.jsx', currentFile)).toBe('src/components/Card')
      expect(normalizePath('./utils.js', currentFile)).toBe('src/components/utils')
      expect(normalizePath('./types.ts', currentFile)).toBe('src/components/types')
      expect(normalizePath('./Component.tsx', currentFile)).toBe('src/components/Component')
    })

    test('should remove trailing /index', () => {
      const currentFile = 'src/components/Button.jsx'
      
      expect(normalizePath('./Card/index', currentFile)).toBe('src/components/Card')
      expect(normalizePath('../utils/index.js', currentFile)).toBe('src/utils')
    })

    test('should handle current directory imports', () => {
      const currentFile = 'src/components/forms/LoginForm.jsx'
      
      expect(normalizePath('.', currentFile)).toBe('src/components/forms')
    })

    test('should handle relative imports', () => {
      const currentFile = 'src/components/Button.jsx'
      
      expect(normalizePath('./Card', currentFile)).toBe('src/components/Card')
      expect(normalizePath('../utils/helper', currentFile)).toBe('src/utils/helper')
      expect(normalizePath('../../config/settings', currentFile)).toBe('config/settings')
    })

    test('should handle absolute imports from project root', () => {
      const currentFile = 'src/components/Button.jsx'
      
      expect(normalizePath('utils/helper', currentFile)).toBe('src/utils/helper')
      expect(normalizePath('config/settings', currentFile)).toBe('src/config/settings')
    })

    test('should preserve src/ prefixed paths', () => {
      const currentFile = 'src/components/Button.jsx'
      
      expect(normalizePath('src/utils/helper', currentFile)).toBe('src/utils/helper')
      expect(normalizePath('src/config/settings', currentFile)).toBe('src/config/settings')
    })

    test('should normalize slashes and remove duplicates', () => {
      const currentFile = 'src/components/Button.jsx'
      
      expect(normalizePath('./utils/helper', currentFile)).toBe('src/components/utils/helper')
      expect(normalizePath('./utils//helper', currentFile)).toBe('src/components/utils/helper')
    })

    test('should handle empty alias map', () => {
      const currentFile = 'src/components/Button.jsx'
      
      expect(normalizePath('./Card', currentFile, {})).toBe('src/components/Card')
      expect(normalizePath('./Card', currentFile)).toBe('src/components/Card')
    })
  })

  describe('findActualFile', () => {
    const testDir = path.join(__dirname, 'test-files')
    
    beforeAll(() => {
      // Create test directory structure
      fs.mkdirSync(testDir, { recursive: true })
      fs.mkdirSync(path.join(testDir, 'components'), { recursive: true })
      
      // Create test files
      fs.writeFileSync(path.join(testDir, 'Button.jsx'), '')
      fs.writeFileSync(path.join(testDir, 'Card.js'), '')
      fs.writeFileSync(path.join(testDir, 'components', 'index.ts'), '')
      fs.writeFileSync(path.join(testDir, 'utils.tsx'), '')
    })

    afterAll(() => {
      // Clean up test files
      if (fs.existsSync(testDir)) {
        rimrafSync(testDir)
      }
    })

    test('should find files with different extensions', () => {
      const basePath = path.join(testDir, 'Button')
      const result = findActualFile(basePath)
      expect(result).toContain('Button.jsx')
    })

    test('should find index files in directories', () => {
      const basePath = path.join(testDir, 'components')
      const result = findActualFile(basePath)
      expect(result).toContain('components/index.ts')
    })

    test('should return null for non-existent files', () => {
      const basePath = path.join(testDir, 'NonExistent')
      const result = findActualFile(basePath)
      expect(result).toBeNull()
    })

    test('should prioritize direct files over index files', () => {
      // Create both a direct file and index file
      const directFile = path.join(testDir, 'Test.js')
      const indexFile = path.join(testDir, 'Test', 'index.js')
      
      fs.writeFileSync(directFile, '')
      fs.mkdirSync(path.dirname(indexFile), { recursive: true })
      fs.writeFileSync(indexFile, '')
      
      const result = findActualFile(path.join(testDir, 'Test'))
      expect(result).toContain('Test.js')
      
      // Clean up
      fs.unlinkSync(directFile)
      rimrafSync(path.dirname(indexFile))
    })

    test('should normalize paths with backslashes', () => {
      const basePath = path.join(testDir, 'Card').replace(/\//g, '\\')
      const result = findActualFile(basePath)
      expect(result).toContain('Card.js')
    })
  })

  describe('rimrafSync', () => {
    const testDir = path.join(__dirname, 'test-rimraf')
    
    beforeEach(() => {
      // Create test directory structure
      fs.mkdirSync(testDir, { recursive: true })
      fs.mkdirSync(path.join(testDir, 'subdir'), { recursive: true })
      fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content1')
      fs.writeFileSync(path.join(testDir, 'subdir', 'file2.txt'), 'content2')
    })

    test('should remove directory and all contents', () => {
      expect(fs.existsSync(testDir)).toBe(true)
      
      rimrafSync(testDir)
      
      expect(fs.existsSync(testDir)).toBe(false)
    })

    test('should handle non-existent directories gracefully', () => {
      const nonExistentDir = path.join(__dirname, 'non-existent')
      
      expect(() => rimrafSync(nonExistentDir)).not.toThrow()
    })

    test('should preserve output directory', () => {
      const outputDir = path.join(__dirname, 'output')
      fs.mkdirSync(outputDir, { recursive: true })
      fs.writeFileSync(path.join(outputDir, 'test.txt'), 'content')
      
      rimrafSync(outputDir)
      
      // Directory should exist but be empty
      expect(fs.existsSync(outputDir)).toBe(true)
      expect(fs.readdirSync(outputDir)).toHaveLength(0)
      
      // Clean up
      fs.rmdirSync(outputDir)
    })

    afterEach(() => {
      // Ensure cleanup in case test fails
      if (fs.existsSync(testDir)) {
        try {
          rimrafSync(testDir)
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    })
  })

  describe('ensureDirectory', () => {
    const testDir = path.join(__dirname, 'test-ensure')
    
    afterEach(() => {
      // Clean up after each test
      if (fs.existsSync(testDir)) {
        rimrafSync(testDir)
      }
    })

    test('should create directory if it does not exist', () => {
      expect(fs.existsSync(testDir)).toBe(false)
      
      const result = ensureDirectory(testDir)
      
      expect(fs.existsSync(testDir)).toBe(true)
      expect(fs.lstatSync(testDir).isDirectory()).toBe(true)
      expect(result).toBe(testDir)
    })

    test('should preserve existing directory when clean=false', () => {
      // Create directory with content
      fs.mkdirSync(testDir, { recursive: true })
      fs.writeFileSync(path.join(testDir, 'existing.txt'), 'content')
      
      ensureDirectory(testDir, false)
      
      expect(fs.existsSync(testDir)).toBe(true)
      expect(fs.existsSync(path.join(testDir, 'existing.txt'))).toBe(true)
    })

    test('should clean existing directory when clean=true', () => {
      // Create directory with content
      fs.mkdirSync(testDir, { recursive: true })
      fs.mkdirSync(path.join(testDir, 'subdir'))
      fs.writeFileSync(path.join(testDir, 'existing.txt'), 'content')
      fs.writeFileSync(path.join(testDir, 'subdir', 'nested.txt'), 'nested')
      
      ensureDirectory(testDir, true)
      
      expect(fs.existsSync(testDir)).toBe(true)
      expect(fs.readdirSync(testDir)).toHaveLength(0)
    })

    test('should create nested directories recursively', () => {
      const nestedDir = path.join(testDir, 'level1', 'level2', 'level3')
      
      ensureDirectory(nestedDir)
      
      expect(fs.existsSync(nestedDir)).toBe(true)
      expect(fs.lstatSync(nestedDir).isDirectory()).toBe(true)
    })

    test('should handle directories with mixed file types', () => {
      // Create directory with files and subdirectories
      fs.mkdirSync(testDir, { recursive: true })
      fs.mkdirSync(path.join(testDir, 'subdir1'))
      fs.mkdirSync(path.join(testDir, 'subdir2'))
      fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content1')
      fs.writeFileSync(path.join(testDir, 'file2.txt'), 'content2')
      fs.writeFileSync(path.join(testDir, 'subdir1', 'nested.txt'), 'nested')
      
      ensureDirectory(testDir, true)
      
      expect(fs.existsSync(testDir)).toBe(true)
      expect(fs.readdirSync(testDir)).toHaveLength(0)
    })
  })
})