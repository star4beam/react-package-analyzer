const fs = require('fs')
const path = require('path')
const { loadCustomConfig, mergeConfigs } = require('../../../src/config/ConfigLoader')

jest.mock('fs')

describe('ConfigLoader', () => {
    const originalCwd = process.cwd
    const mockCwd = jest.fn()
    
    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetModules()
        process.cwd = mockCwd
        mockCwd.mockReturnValue('/test/project')
        // Clear require cache for config files
        Object.keys(require.cache).forEach(key => {
            if (key.includes('config.js')) {
                delete require.cache[key]
            }
        })
    })
    
    afterEach(() => {
        process.cwd = originalCwd
    })
    
    describe('loadCustomConfig', () => {
        it('should load custom config from specified path', () => {
            const configPath = '/custom/config.js'
            const mockConfig = { packagesToTrack: ['react'] }
            
            fs.existsSync.mockReturnValue(true)
            jest.doMock(configPath, () => mockConfig, { virtual: true })
            
            const result = loadCustomConfig(configPath)
            
            expect(fs.existsSync).toHaveBeenCalledWith(configPath)
            expect(result).toEqual(mockConfig)
        })
        
        it('should load default config when no path specified', () => {
            const defaultPath = path.join('/test/project', 'react-import-analyzer.config.js')
            const mockConfig = { packagesToTrack: ['vue'] }
            
            fs.existsSync.mockReturnValue(true)
            jest.doMock(defaultPath, () => mockConfig, { virtual: true })
            
            const result = loadCustomConfig()
            
            expect(fs.existsSync).toHaveBeenCalledWith(defaultPath)
            expect(result).toEqual(mockConfig)
        })
        
        it('should return null when config file does not exist', () => {
            fs.existsSync.mockReturnValue(false)
            
            const result = loadCustomConfig('/nonexistent/config.js')
            
            expect(result).toBeNull()
        })
        
        it('should return null and warn when config file has errors', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
            const configPath = '/error/config.js'
            
            fs.existsSync.mockReturnValue(true)
            jest.doMock(configPath, () => {
                throw new Error('Invalid config')
            }, { virtual: true })
            
            const result = loadCustomConfig(configPath)
            
            expect(result).toBeNull()
            expect(consoleSpy).toHaveBeenCalledWith('Could not load custom config:', 'Invalid config')
            
            consoleSpy.mockRestore()
        })
    })
    
    describe('mergeConfigs', () => {
        const defaultConfig = {
            packagesToTrack: [],
            aliasMap: {},
            include: 'src/**/*.{js,jsx,ts,tsx}',
            exclude: ['node_modules/**/*', 'dist/**/*'],
            outputDir: './import-analysis',
            format: 'json,markdown'
        }
        
        it('should return default config when no options provided', () => {
            const result = mergeConfigs()
            
            expect(result).toEqual(defaultConfig)
        })
        
        it('should merge custom config with defaults', () => {
            const customConfig = {
                packagesToTrack: ['react'],
                outputDir: './custom-output'
            }
            
            const result = mergeConfigs({}, customConfig)
            
            expect(result).toEqual({
                ...defaultConfig,
                packagesToTrack: ['react'],
                outputDir: './custom-output'
            })
        })
        
        it('should prioritize CLI options over custom config', () => {
            const customConfig = {
                packagesToTrack: ['react'],
                outputDir: './custom-output'
            }
            
            const cliOptions = {
                packagesToTrack: ['vue'],
                format: 'json'
            }
            
            const result = mergeConfigs(cliOptions, customConfig)
            
            expect(result).toEqual({
                ...defaultConfig,
                packagesToTrack: ['vue'],
                outputDir: './custom-output',
                format: 'json'
            })
        })
        
        it('should convert string packagesToTrack to array', () => {
            const customConfig = {
                packagesToTrack: 'react'
            }
            
            const result = mergeConfigs({}, customConfig)
            
            expect(result.packagesToTrack).toEqual(['react'])
        })
        
        it('should convert non-array exclude to array', () => {
            const customConfig = {
                exclude: 'test/**/*'
            }
            
            const result = mergeConfigs({}, customConfig)
            
            expect(result.exclude).toEqual(['test/**/*'])
        })
        
        it('should preserve array exclude', () => {
            const customConfig = {
                exclude: ['test/**/*', 'build/**/*']
            }
            
            const result = mergeConfigs({}, customConfig)
            
            expect(result.exclude).toEqual(['test/**/*', 'build/**/*'])
        })
        
        it('should handle complex merge scenarios', () => {
            const customConfig = {
                packagesToTrack: 'react',
                aliasMap: { '@': './src' },
                exclude: 'test/**/*',
                newOption: 'custom'
            }
            
            const cliOptions = {
                packagesToTrack: ['vue', 'react'],
                format: 'markdown',
                anotherOption: 'cli'
            }
            
            const result = mergeConfigs(cliOptions, customConfig)
            
            expect(result).toEqual({
                packagesToTrack: ['vue', 'react'],
                aliasMap: { '@': './src' },
                include: 'src/**/*.{js,jsx,ts,tsx}',
                exclude: ['test/**/*'],
                outputDir: './import-analysis',
                format: 'markdown',
                newOption: 'custom',
                anotherOption: 'cli'
            })
        })
    })
})