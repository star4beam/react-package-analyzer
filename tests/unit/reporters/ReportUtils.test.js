const {
  simplifyFilePath,
  createFileLink,
  createSafeAnchor,
  sanitizePackageName,
  formatCategoryName,
  generateBarChart,
  createMarkdownLink
} = require('../../../src/reporters/ReportUtils')

describe('ReportUtils', () => {
  describe('simplifyFilePath', () => {
    test('should return empty string for empty input', () => {
      expect(simplifyFilePath('')).toBe('')
      expect(simplifyFilePath(null)).toBe('')
      expect(simplifyFilePath(undefined)).toBe('')
    })

    test('should return full path for short paths (6 parts or fewer)', () => {
      expect(simplifyFilePath('src/components/Button.jsx')).toBe('src/components/Button.jsx')
      expect(simplifyFilePath('a/b/c/d/e/f')).toBe('a/b/c/d/e/f')
      expect(simplifyFilePath('single')).toBe('single')
    })

    test('should simplify long paths (more than 6 parts)', () => {
      const longPath = 'src/components/common/forms/inputs/advanced/TextField.jsx'
      expect(simplifyFilePath(longPath)).toBe('src/components/common/.../inputs/advanced/TextField.jsx')
    })

    test('should handle very long paths correctly', () => {
      const veryLongPath = 'project/src/components/ui/forms/advanced/inputs/text/components/TextField.jsx'
      expect(simplifyFilePath(veryLongPath)).toBe('project/src/components/.../text/components/TextField.jsx')
    })

    test('should handle paths with single character parts', () => {
      const path = 'a/b/c/d/e/f/g/h/i'
      expect(simplifyFilePath(path)).toBe('a/b/c/.../g/h/i')
    })
  })

  describe('createFileLink', () => {
    test('should return empty string for empty input', () => {
      expect(createFileLink('')).toBe('')
      expect(createFileLink(null)).toBe('')
      expect(createFileLink(undefined)).toBe('')
    })

    test('should create link without base URL', () => {
      const filePath = 'src/components/Button.jsx'
      expect(createFileLink(filePath)).toBe('[src/components/Button.jsx](/src/components/Button.jsx)')
    })

    test('should create link with base URL', () => {
      const filePath = 'src/components/Button.jsx'
      const baseUrl = 'https://github.com/user/repo/blob/main'
      expect(createFileLink(filePath, baseUrl)).toBe('[src/components/Button.jsx](https://github.com/user/repo/blob/main/src/components/Button.jsx)')
    })

    test('should simplify long paths in link text but preserve full path in URL', () => {
      const longPath = 'src/components/common/forms/inputs/advanced/TextField.jsx'
      const baseUrl = 'https://github.com/user/repo'
      const result = createFileLink(longPath, baseUrl)
      expect(result).toBe('[src/components/common/.../inputs/advanced/TextField.jsx](https://github.com/user/repo/src/components/common/forms/inputs/advanced/TextField.jsx)')
    })

    test('should handle empty base URL gracefully', () => {
      const filePath = 'src/Button.jsx'
      expect(createFileLink(filePath, '')).toBe('[src/Button.jsx](/src/Button.jsx)')
    })
  })

  describe('createSafeAnchor', () => {
    test('should convert text to safe anchor ID', () => {
      expect(createSafeAnchor('Hello World')).toBe('Hello-World')
      expect(createSafeAnchor('React Component Analysis')).toBe('React-Component-Analysis')
    })

    test('should handle special characters', () => {
      expect(createSafeAnchor('Button & TextField')).toBe('Button-TextField')
      expect(createSafeAnchor('@mui/material')).toBe('mui-material')
      expect(createSafeAnchor('file.name.with.dots')).toBe('file-name-with-dots')
    })

    test('should remove leading and trailing dashes', () => {
      expect(createSafeAnchor('---text---')).toBe('text')
      expect(createSafeAnchor('!@#$text!@#$')).toBe('text')
    })

    test('should handle numbers and letters', () => {
      expect(createSafeAnchor('Component123Test')).toBe('Component123Test')
      expect(createSafeAnchor('test-123-abc')).toBe('test-123-abc')
    })

    test('should handle empty or special-only strings', () => {
      expect(createSafeAnchor('')).toBe('component')
      expect(createSafeAnchor('!@#$%^&*()')).toBe('component')
      expect(createSafeAnchor('   ')).toBe('component')
    })

    test('should handle special component names', () => {
      expect(createSafeAnchor('*')).toBe('namespace')
      expect(createSafeAnchor('default')).toBe('default')
    })
  })

  describe('sanitizePackageName', () => {
    test('should replace forward slashes with underscores', () => {
      expect(sanitizePackageName('@mui/material')).toBe('@mui_material')
      expect(sanitizePackageName('@chakra-ui/react')).toBe('@chakra-ui_react')
      expect(sanitizePackageName('react-router/dom')).toBe('react-router_dom')
    })

    test('should handle packages without slashes', () => {
      expect(sanitizePackageName('react')).toBe('react')
      expect(sanitizePackageName('lodash')).toBe('lodash')
    })

    test('should handle multiple slashes', () => {
      expect(sanitizePackageName('some/deeply/nested/package')).toBe('some_deeply_nested_package')
    })

    test('should handle empty string', () => {
      expect(sanitizePackageName('')).toBe('')
    })
  })

  describe('formatCategoryName', () => {
    test('should convert camelCase to Title Case', () => {
      expect(formatCategoryName('eventHandler')).toBe('Event Handler')
      expect(formatCategoryName('customization')).toBe('Customization')
      expect(formatCategoryName('accessibilityProps')).toBe('Accessibility Props')
    })

    test('should handle single words', () => {
      expect(formatCategoryName('styling')).toBe('Styling')
      expect(formatCategoryName('data')).toBe('Data')
    })

    test('should handle already formatted text', () => {
      expect(formatCategoryName('Already Formatted')).toBe('Already  Formatted')
    })

    test('should handle edge cases', () => {
      expect(formatCategoryName('')).toBe('Unknown')
      expect(formatCategoryName(null)).toBe('Unknown')
      expect(formatCategoryName(undefined)).toBe('Unknown')
    })

    test('should handle multiple capital letters', () => {
      expect(formatCategoryName('XMLHttpRequest')).toBe('X M L Http Request')
      expect(formatCategoryName('URLPattern')).toBe('U R L Pattern')
    })
  })

  describe('generateBarChart', () => {
    test('should generate proper bar chart for normal values', () => {
      const result = generateBarChart(5, 10, 10)
      expect(result).toBe('█████     ')
      expect(result.length).toBe(10)
    })

    test('should handle zero total', () => {
      expect(generateBarChart(5, 0)).toBe('|')
      expect(generateBarChart(0, 0)).toBe('|')
    })

    test('should handle full bar', () => {
      const result = generateBarChart(10, 10, 5)
      expect(result).toBe('█████')
    })

    test('should handle empty bar', () => {
      const result = generateBarChart(0, 10, 5)
      expect(result).toBe('     ')
    })

    test('should handle custom max length', () => {
      const result = generateBarChart(3, 4, 8)
      expect(result).toBe('██████  ')
      expect(result.length).toBe(8)
    })

    test('should handle decimal values correctly', () => {
      const result = generateBarChart(1, 3, 6)
      expect(result.length).toBe(6)
      expect(result).toMatch(/^█*\s*$/)
    })

    test('should use default max length when not specified', () => {
      const result = generateBarChart(10, 20)
      expect(result.length).toBe(20)
      expect(result).toBe('██████████          ')
    })
  })

  describe('createMarkdownLink', () => {
    test('should create proper markdown links', () => {
      expect(createMarkdownLink('Google', 'https://google.com')).toBe('[Google](https://google.com)')
      expect(createMarkdownLink('Home', '/home')).toBe('[Home](/home)')
    })

    test('should handle empty text', () => {
      expect(createMarkdownLink('', 'https://example.com')).toBe('')
      expect(createMarkdownLink(null, 'https://example.com')).toBe('')
    })

    test('should handle empty URL', () => {
      expect(createMarkdownLink('Text', '')).toBe('Text')
      expect(createMarkdownLink('Text', null)).toBe('Text')
    })

    test('should handle both empty values', () => {
      expect(createMarkdownLink('', '')).toBe('')
      expect(createMarkdownLink(null, null)).toBe('')
    })

    test('should handle special characters in text and URL', () => {
      expect(createMarkdownLink('Special & Characters', '/path?query=value&other=123')).toBe('[Special & Characters](/path?query=value&other=123)')
    })
  })
})