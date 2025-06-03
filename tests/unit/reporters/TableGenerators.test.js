const {
    generateKeyComponentFiles,
    generateFeatureLevelTable,
    generatePackageTable,
    generateUsageFrequencyTable,
    generateCriticalPropsTable,
    generateSpecialPropsTable,
    calculateComponentDensity,
    getComponentFeatureLevel,
    hasSpecificProp,
    calculateImpactScore
} = require('../../../src/reporters/TableGenerators')

const utils = require('../../../src/reporters/ReportUtils')

// Mock ReportUtils
jest.mock('../../../src/reporters/ReportUtils', () => ({
    createMarkdownLink: jest.fn((text, link) => `[${text}](${link})`),
    createFileLink: jest.fn((path, repoUrl) => `[${path}](${repoUrl}/tree/main/${path})`),
    createSafeAnchor: jest.fn(name => name.toLowerCase().replace(/[^a-z0-9-]/g, '-')),
    sanitizePackageName: jest.fn(name => name.replace(/[^a-z0-9-]/g, '-'))
}))

describe('TableGenerators', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })
    
    afterEach(() => {
        console.error.mockRestore()
    })
    
    describe('generateKeyComponentFiles', () => {
        it('should generate table for key component files', () => {
            const detailedReport = {
                files: [
                    {
                        path: 'src/App.js',
                        componentsUsed: [
                            { name: 'Button', package: 'react', props: ['onClick', 'children'] },
                            { name: 'Card', package: '@mui/material', props: ['title'] }
                        ]
                    },
                    {
                        path: 'src/Dashboard.js',
                        componentsUsed: [
                            { name: 'Grid', package: '@mui/material', props: ['container', 'spacing'] }
                        ]
                    }
                ]
            }
            
            const result = generateKeyComponentFiles(detailedReport, 'https://github.com/user/repo')
            
            expect(result).toContain('| File | Components | Props Used | Components |')
            expect(result).toContain('[src/App.js]')
            expect(result).toContain('| 2 | 3 |')
            expect(result).toContain('[Button]')
            expect(result).toContain('[Card]')
            expect(utils.createFileLink).toHaveBeenCalledWith('src/App.js', 'https://github.com/user/repo')
        })
        
        it('should return message when no files available', () => {
            const result = generateKeyComponentFiles(null, 'https://github.com/user/repo')
            expect(result).toBe('No key component files identified.')
        })
        
        it('should handle empty files array', () => {
            const detailedReport = { files: [] }
            const result = generateKeyComponentFiles(detailedReport, 'https://github.com/user/repo')
            expect(result).toBe('No key component files identified.')
        })
        
        it('should handle files without components', () => {
            const detailedReport = {
                files: [
                    { path: 'src/utils.js', componentsUsed: [] },
                    { path: 'src/constants.js' }
                ]
            }
            
            const result = generateKeyComponentFiles(detailedReport, 'https://github.com/user/repo')
            
            expect(result).toContain('| 0 | 0 |')
        })
        
        it('should handle errors gracefully', () => {
            const detailedReport = {
                files: [{ path: 'src/App.js' }]
            }
            
            // Mock to throw error
            utils.createFileLink.mockImplementation(() => { throw new Error('Link error') })
            
            const result = generateKeyComponentFiles(detailedReport, 'https://github.com/user/repo')
            
            expect(result).toBe('Error generating key component files table.')
            expect(console.error).toHaveBeenCalled()
        })
    })
    
    describe('generateFeatureLevelTable', () => {
        const mockGetComponentFeatureLevel = jest.fn()
        
        beforeEach(() => {
            mockGetComponentFeatureLevel.mockImplementation(comp => {
                if (comp.totalUsages > 50) return 'High'
                if (comp.totalUsages > 20) return 'Medium'
                if (comp.totalUsages > 5) return 'Low'
                return 'Very Low'
            })
        })
        
        it('should generate feature level table with collapsible sections', () => {
            const detailedReport = {
                components: [
                    { name: 'Button', package: 'react', totalUsages: 60, fileCount: 10, props: { unique: ['onClick'] }, propSetsByComponent: [] },
                    { name: 'Card', package: '@mui/material', totalUsages: 25, fileCount: 5, props: { unique: ['title'] }, propSetsByComponent: [] },
                    { name: 'Icon', package: 'react-icons', totalUsages: 8, fileCount: 3, props: { unique: [] }, propSetsByComponent: [] }
                ]
            }
            
            const result = generateFeatureLevelTable(detailedReport, mockGetComponentFeatureLevel)
            
            expect(result).toContain('<details>')
            expect(result).toContain('🔴 High Feature Intensity (1 components)')
            expect(result).toContain('🟠 Medium Feature Intensity (1 components)')
            expect(result).toContain('🟡 Low Feature Intensity (1 components)')
            expect(result).toContain('[Button]')
            expect(result).toContain('| 60 |')
            expect(result).toContain('</details>')
        })
        
        it('should calculate impact scores correctly', () => {
            const detailedReport = {
                components: [
                    { 
                        name: 'Button', 
                        package: 'react', 
                        totalUsages: 100, 
                        fileCount: 10, 
                        props: { unique: Array(20).fill('prop') }, 
                        propSetsByComponent: Array(20).fill({})
                    }
                ]
            }
            
            const result = generateFeatureLevelTable(detailedReport, mockGetComponentFeatureLevel)
            
            // With max scores: usage=10, props=10, diversity=10
            // Impact = (10*0.4) + (10*0.2) + (10*0.4) = 10.0
            expect(result).toContain('| 10.0 |')
        })
        
        it('should handle empty components', () => {
            const result = generateFeatureLevelTable({ components: [] }, mockGetComponentFeatureLevel)
            expect(result).toBe('No component feature level data available.')
        })
        
        it('should skip empty feature level groups', () => {
            const detailedReport = {
                components: [
                    { name: 'Button', package: 'react', totalUsages: 60 }
                ]
            }
            
            const result = generateFeatureLevelTable(detailedReport, mockGetComponentFeatureLevel)
            
            expect(result).toContain('🔴 High')
            expect(result).not.toContain('🟢 Very Low')
        })
    })
    
    describe('generatePackageTable', () => {
        const mockGetComponentFeatureLevel = jest.fn().mockReturnValue('Medium')
        
        it('should group components by package', () => {
            const detailedReport = {
                components: [
                    { name: 'Button', package: '@mui/material', totalUsages: 30, fileCount: 5, props: { unique: ['onClick'] } },
                    { name: 'Card', package: '@mui/material', totalUsages: 20, fileCount: 4, props: { unique: [] } },
                    { name: 'Icon', package: 'react-icons', totalUsages: 15, fileCount: 3, props: { unique: [] } }
                ]
            }
            
            const result = generatePackageTable(detailedReport, mockGetComponentFeatureLevel)
            
            expect(result).toContain('@mui/material (2 components)')
            expect(result).toContain('react-icons (1 components)')
            expect(result).toContain('[Button]')
            expect(result).toContain('🟠 Medium')
        })
        
        it('should sort packages by component count', () => {
            const detailedReport = {
                components: [
                    { name: 'A', package: 'pkg1', totalUsages: 1 },
                    { name: 'B', package: 'pkg2', totalUsages: 1 },
                    { name: 'C', package: 'pkg2', totalUsages: 1 },
                    { name: 'D', package: 'pkg2', totalUsages: 1 }
                ]
            }
            
            const result = generatePackageTable(detailedReport, mockGetComponentFeatureLevel)
            
            // pkg2 should appear before pkg1
            const pkg2Index = result.indexOf('pkg2')
            const pkg1Index = result.indexOf('pkg1')
            expect(pkg2Index).toBeLessThan(pkg1Index)
        })
        
        it('should handle components without package', () => {
            const detailedReport = {
                components: [
                    { name: 'CustomComponent', totalUsages: 10 }
                ]
            }
            
            const result = generatePackageTable(detailedReport, mockGetComponentFeatureLevel)
            
            expect(result).toContain('unknown-package (1 components)')
        })
    })
    
    describe('generateUsageFrequencyTable', () => {
        it('should group components by usage frequency', () => {
            const detailedReport = {
                components: [
                    { name: 'VeryHigh', package: 'react', totalUsages: 75, fileCount: 20, props: { unique: [] } },
                    { name: 'High', package: 'react', totalUsages: 30, fileCount: 10, props: { unique: [] } },
                    { name: 'Medium', package: 'react', totalUsages: 15, fileCount: 5, props: { unique: [] } },
                    { name: 'Low', package: 'react', totalUsages: 7, fileCount: 3, props: { unique: [] } },
                    { name: 'VeryLow', package: 'react', totalUsages: 2, fileCount: 1, props: { unique: [] } }
                ]
            }
            
            const result = generateUsageFrequencyTable(detailedReport)
            
            expect(result).toContain('Very High (50+) Usage (1 components)')
            expect(result).toContain('High (20-49) Usage (1 components)')
            expect(result).toContain('Medium (10-19) Usage (1 components)')
            expect(result).toContain('Low (5-9) Usage (1 components)')
            expect(result).toContain('Very Low (1-4) Usage (1 components)')
            expect(result).toContain('[VeryHigh]')
            expect(result).toContain('| 75 |')
        })
        
        it('should handle empty usage groups', () => {
            const detailedReport = {
                components: [
                    { name: 'OnlyHigh', package: 'react', totalUsages: 100 }
                ]
            }
            
            const result = generateUsageFrequencyTable(detailedReport)
            
            expect(result).toContain('Very High (50+)')
            expect(result).not.toContain('Low (5-9)')
        })
    })
    
    describe('generateCriticalPropsTable', () => {
        it('should identify components with critical props', () => {
            const detailedReport = {
                components: [
                    {
                        name: 'Button',
                        package: 'react',
                        props: {
                            byCategory: {
                                styling: ['className', 'style'],
                                behavior: ['onClick', 'onHover'],
                                accessibility: ['aria-label'],
                                data: ['value']
                            }
                        }
                    },
                    {
                        name: 'Text',
                        package: 'react',
                        props: {
                            byCategory: {
                                styling: ['fontSize']
                            }
                        }
                    }
                ]
            }
            
            const result = generateCriticalPropsTable(detailedReport)
            
            expect(result).toContain('| Component | Package | Styling | Behavior | Accessibility | Data |')
            expect(result).toContain('[Button]')
            expect(result).toContain('| 2 | 2 | 1 | 1 |')
            expect(result).toContain('[Text]')
            expect(result).toContain('| 1 | 0 | 0 | 0 |')
        })
        
        it('should highlight high prop counts with bold', () => {
            const detailedReport = {
                components: [
                    {
                        name: 'ComplexComponent',
                        package: 'react',
                        props: {
                            byCategory: {
                                styling: Array(10).fill('prop'),
                                behavior: Array(10).fill('prop'),
                                accessibility: Array(5).fill('prop'),
                                data: Array(10).fill('prop')
                            }
                        }
                    }
                ]
            }
            
            const result = generateCriticalPropsTable(detailedReport)
            
            expect(result).toContain('**10**') // Styling props > 5
            expect(result).toContain('**5**') // Accessibility props > 3
        })
        
        it('should handle components without critical props', () => {
            const detailedReport = {
                components: [
                    {
                        name: 'SimpleComponent',
                        package: 'react',
                        props: {
                            byCategory: {
                                other: ['someProp']
                            }
                        }
                    }
                ]
            }
            
            const result = generateCriticalPropsTable(detailedReport)
            
            expect(result).toBe('No components with critical props identified.')
        })
    })
    
    describe('generateSpecialPropsTable', () => {
        const mockHasSpecificProp = jest.fn()
        
        beforeEach(() => {
            mockHasSpecificProp.mockImplementation((comp, prop) => {
                return comp.specialProps && comp.specialProps.includes(prop)
            })
        })
        
        it('should generate table for components with special props', () => {
            const detailedReport = {
                components: [
                    {
                        name: 'Button',
                        package: 'react',
                        specialProps: ['className', 'onClick', 'children']
                    },
                    {
                        name: 'Input',
                        package: 'react',
                        specialProps: ['style', 'data-testid']
                    }
                ]
            }
            
            const result = generateSpecialPropsTable(detailedReport, mockHasSpecificProp)
            
            expect(result).toContain('| Component | Package | className | style | onClick | data-testid | aria-* | ref | key | children |')
            expect(result).toContain('[Button]')
            expect(result).toContain('✅') // For className, onClick, children
            expect(result).toContain('-') // For props Button doesn't have
        })
        
        it('should sort components by number of special props', () => {
            const detailedReport = {
                components: [
                    { name: 'A', package: 'react', specialProps: ['className'] },
                    { name: 'B', package: 'react', specialProps: ['className', 'style', 'onClick'] },
                    { name: 'C', package: 'react', specialProps: ['className', 'style'] }
                ]
            }
            
            const result = generateSpecialPropsTable(detailedReport, mockHasSpecificProp)
            
            const lines = result.split('\n')
            const dataLines = lines.filter(line => line.includes('[A]') || line.includes('[B]') || line.includes('[C]'))
            
            // B should come first (3 props), then C (2 props), then A (1 prop)
            expect(dataLines[0]).toContain('[B]')
            expect(dataLines[1]).toContain('[C]')
            expect(dataLines[2]).toContain('[A]')
        })
    })
    
    describe('calculateComponentDensity', () => {
        it('should calculate density based on components per line', () => {
            const files = [
                { path: 'src/App.js', componentsUsed: Array(10).fill({}), lineCount: 100 },
                { path: 'src/Dense.js', componentsUsed: Array(20).fill({}), lineCount: 100 }
            ]
            
            expect(calculateComponentDensity('src/App.js', files)).toBe('Very High')
            expect(calculateComponentDensity('src/Dense.js', files)).toBe('Very High')
        })
        
        it('should handle missing file', () => {
            expect(calculateComponentDensity('unknown.js', [])).toBe('Unknown')
        })
        
        it('should handle zero line count', () => {
            const files = [
                { path: 'src/Empty.js', componentsUsed: [], lineCount: 0 }
            ]
            
            expect(calculateComponentDensity('src/Empty.js', files)).toBe('None')
        })
        
        it('should categorize density levels correctly', () => {
            const testCases = [
                { components: 15, lines: 100, expected: 'Very High' }, // 0.15
                { components: 7, lines: 100, expected: 'High' }, // 0.07
                { components: 3, lines: 100, expected: 'Medium' }, // 0.03
                { components: 1, lines: 100, expected: 'Low' }, // 0.01
                { components: 0, lines: 100, expected: 'None' } // 0
            ]
            
            testCases.forEach(({ components, lines, expected }) => {
                const files = [{
                    path: 'test.js',
                    componentsUsed: Array(components).fill({}),
                    lineCount: lines
                }]
                
                expect(calculateComponentDensity('test.js', files)).toBe(expected)
            })
        })
    })
    
    describe('getComponentFeatureLevel', () => {
        it('should calculate feature level based on multiple factors', () => {
            const component = {
                totalUsages: 50,
                props: { unique: Array(10).fill('prop') },
                fileCount: 10,
                propSetsByComponent: Array(5).fill({ files: ['file1'] })
            }
            
            const result = getComponentFeatureLevel(component)
            expect(result).toBe('High')
        })
        
        it('should return High for components with high scores', () => {
            const component = {
                totalUsages: 100,
                props: { unique: Array(20).fill('prop') },
                fileCount: 20,
                propSetsByComponent: Array(10).fill({ files: ['file1'] })
            }
            
            const result = getComponentFeatureLevel(component)
            expect(result).toBe('High')
        })
        
        it('should apply standardization boost', () => {
            const component = {
                totalUsages: 10,
                props: { unique: Array(5).fill('prop') },
                fileCount: 5,
                propSetsByComponent: [
                    { files: Array(8).fill('file') } // 80% standardization
                ]
            }
            
            const result = getComponentFeatureLevel(component)
            // Should get a boost from high standardization
            expect(['Medium', 'Low']).toContain(result)
        })
        
        it('should handle missing data gracefully', () => {
            const component = {}
            const result = getComponentFeatureLevel(component)
            expect(result).toBe('Very Low')
        })
    })
    
    describe('hasSpecificProp', () => {
        it('should find exact prop matches', () => {
            const component = {
                props: { unique: ['className', 'onClick', 'disabled'] }
            }
            
            expect(hasSpecificProp(component, 'className')).toBe(true)
            expect(hasSpecificProp(component, 'onClick')).toBe(true)
            expect(hasSpecificProp(component, 'style')).toBe(false)
        })
        
        it('should handle wildcard patterns', () => {
            const component = {
                props: { unique: ['aria-label', 'aria-hidden', 'data-testid'] }
            }
            
            expect(hasSpecificProp(component, 'aria-*')).toBe(true)
            expect(hasSpecificProp(component, 'data-*')).toBe(true)
            expect(hasSpecificProp(component, 'on*')).toBe(false)
        })
        
        it('should handle missing props', () => {
            expect(hasSpecificProp({}, 'className')).toBe(false)
            expect(hasSpecificProp({ props: {} }, 'className')).toBe(false)
        })
    })
    
    describe('calculateImpactScore', () => {
        it('should calculate weighted impact score', () => {
            const component = {
                totalUsages: 100,
                props: { unique: Array(20).fill('prop') },
                propSetsByComponent: Array(20).fill({})
            }
            
            const score = calculateImpactScore(component)
            expect(score).toBe(10) // Max score
        })
        
        it('should handle partial scores', () => {
            const component = {
                totalUsages: 50,
                props: { unique: Array(10).fill('prop') },
                propSetsByComponent: Array(10).fill({})
            }
            
            const score = calculateImpactScore(component)
            expect(score).toBeGreaterThan(0)
            expect(score).toBeLessThan(10)
        })
        
        it('should handle zero values', () => {
            const component = {}
            const score = calculateImpactScore(component)
            expect(score).toBe(0)
        })
    })
})