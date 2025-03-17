#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { runAnalysis } = require('../src/runner')
const { loadCustomConfig, mergeConfigs } = require('../src/config/ConfigLoader')
const { createLogger } = require('../src/utils/logger')
const chalk = require('chalk')

const argv = yargs(hideBin(process.argv))
    .option('packagesToTrack', {
        alias: 'p',
        type: 'array',
        description: 'Packages to analyze'
    })
    .option('config', {
        alias: 'c',
        type: 'string',
        description: 'Path to config file'
    })
    .option('outputDir', {
        alias: 'o',
        type: 'string',
        description: 'Output directory'
    })
    .option('include', {
        type: 'string',
        description: 'Files to include (glob pattern)'
    })
    .option('exclude', {
        type: 'array',
        description: 'Files to exclude (glob patterns)'
    })
    .option('format', {
        alias: 'f',
        type: 'string',
        description: 'Output formats (both JSON and markdown reports will always be generated)',
        default: 'json,markdown'
    })
    .option('repoUrl', {
        alias: 'r',
        type: 'string',
        description: 'Repository URL for file links in markdown report',
        default: 'https://github.com/your-org/your-repo/blob/main'
    })
    .option('silent', {
        alias: 's',
        type: 'boolean',
        description: 'Run in silent mode (no output except errors)',
        default: false
    })
    .option('debug', {
        alias: 'd',
        type: 'boolean',
        description: 'Run in debug mode (verbose output)',
        default: false
    })
    .help()
    .argv

async function main() {
    // Create logger with CLI options
    const logger = createLogger({
        silent: argv.silent,
        debug: argv.debug
    })
    
    try {
        // Load custom config if specified
        const customConfig = loadCustomConfig(argv.config)

        // Create CLI options object
        const cliOptions = {
            packagesToTrack: argv.packagesToTrack,
            outputDir: argv.outputDir,
            include: argv.include,
            exclude: argv.exclude,
            format: argv.format,
            // Pass logger to config
            logger
        }

        // Merge configs
        const config = mergeConfigs(
            // Remove undefined values from CLI options
            Object.fromEntries(
                Object.entries(cliOptions)
                    .filter(([_, value]) => value !== undefined)
            ),
            customConfig
        )

        // Validate required options
        if (!config.packagesToTrack || config.packagesToTrack.length === 0) {
            throw new Error('No packages specified for analysis. Use --packages option or config file.')
        }

        logger.info(`Analyzing packages: ${config.packagesToTrack.join(', ')}`)
        logger.info(`Output directory: ${config.outputDir}`)

        const results = await runAnalysis(config)
        
        logger.success('Analysis complete')
        logger.info(`Reports saved to ${chalk.bold(config.outputDir)}`)
    } catch (error) {
        logger.error('Analysis failed', error)
        process.exit(1)
    }
}

main() 