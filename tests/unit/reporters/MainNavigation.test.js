const {
    generateMainNavigation,
    generateCompactNavigation
} = require('../../../src/reporters/MainNavigation')

describe('MainNavigation', () => {
    describe('generateMainNavigation', () => {
        it('should generate main navigation with default basePath', () => {
            const result = generateMainNavigation()
            
            expect(result).toContain('## Main Navigation')
            expect(result).toContain('| Report | Description |')
            expect(result).toContain('[Main Page](index.md)')
            expect(result).toContain('[Components](components.md)')
            expect(result).toContain('[Files](files.md)')
            expect(result).toContain('[Features](features.md)')
            expect(result).toContain('[Hubs](hubs.md)')
        })
        
        it('should generate main navigation with custom basePath', () => {
            const result = generateMainNavigation('../../')
            
            expect(result).toContain('[Main Page](../../index.md)')
            expect(result).toContain('[Components](../../components.md)')
            expect(result).toContain('[Files](../../files.md)')
            expect(result).toContain('[Features](../../features.md)')
            expect(result).toContain('[Hubs](../../hubs.md)')
        })
        
        it('should include descriptions for each link', () => {
            const result = generateMainNavigation()
            
            expect(result).toContain('Dashboard and overview of all reports')
            expect(result).toContain('Detailed component usage statistics and insights')
            expect(result).toContain('Files and their component usage statistics')
            expect(result).toContain('Features and their component integration points')
            expect(result).toContain('Hub components and their dependency relationships')
        })
        
        it('should format as markdown table', () => {
            const result = generateMainNavigation()
            const lines = result.split('\n')
            
            expect(lines[2]).toBe('| Report | Description |')
            expect(lines[3]).toBe('|--------|-------------|')
            expect(lines[4]).toMatch(/^\| \[.+\]\(.+\) \| .+ \|$/)
        })
        
        it('should include separator at the end', () => {
            const result = generateMainNavigation()
            const lines = result.split('\n')
            
            expect(lines[lines.length - 3]).toBe('')
            expect(lines[lines.length - 2]).toBe('---')
            expect(lines[lines.length - 1]).toBe('')
        })
    })
    
    describe('generateCompactNavigation', () => {
        it('should generate compact navigation bar with default parameters', () => {
            const result = generateCompactNavigation()
            
            expect(result).toContain('*Navigation:')
            // When no currentPage is specified, all items match (empty string is in all)
            expect(result).toContain('**Home**')
            expect(result).toContain('**Components**')
            expect(result).toContain('**Files**')
            expect(result).toContain('**Features**')
            expect(result).toContain('**Hubs**')
            expect(result).toContain(' | ')
        })
        
        it('should generate compact navigation with custom basePath', () => {
            const result = generateCompactNavigation('../', 'none')
            
            expect(result).toContain('[Home](../index.md)')
            expect(result).toContain('[Components](../components.md)')
            expect(result).toContain('[Files](../files.md)')
            expect(result).toContain('[Features](../features.md)')
            expect(result).toContain('[Hubs](../hubs.md)')
        })
        
        it('should highlight current page', () => {
            const result = generateCompactNavigation('', 'components')
            
            expect(result).toContain('**Components**')
            expect(result).not.toContain('[Components]')
            expect(result).toContain('[Home](index.md)')
            expect(result).toContain('[Files](files.md)')
        })
        
        it('should format as italic navigation line', () => {
            const result = generateCompactNavigation()
            
            expect(result).toMatch(/^\*Navigation: .+\*\n\n$/)
        })
        
        it('should handle page names that are substrings', () => {
            const result = generateCompactNavigation('', 'index')
            
            expect(result).toContain('**Home**')
            expect(result).not.toContain('[Home]')
        })
        
        it('should separate navigation items with pipes', () => {
            const result = generateCompactNavigation()
            const navLine = result.split('\n')[0]
            const pipeCount = (navLine.match(/\|/g) || []).length
            
            expect(pipeCount).toBe(4) // 4 pipes for 5 items
        })
        
        it('should handle empty currentPage', () => {
            const result = generateCompactNavigation('', '')
            
            // Empty string matches all files, so all items are bold
            expect(result).toContain('**Home**')
            expect(result).toContain('**Components**')
            expect(result).toContain('**Files**')
            expect(result).toContain('**Features**')
            expect(result).toContain('**Hubs**')
            
            // No items should be links when empty string matches all
            expect(result).not.toContain('[Home]')
            expect(result).not.toContain('[Components]')
        })
        
        it('should handle complex basePath', () => {
            const result = generateCompactNavigation('../../docs/reports/', 'none')
            
            expect(result).toContain('[Home](../../docs/reports/index.md)')
            expect(result).toContain('[Components](../../docs/reports/components.md)')
        })
    })
})