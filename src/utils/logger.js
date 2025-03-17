const pino = require('pino')
const chalk = require('chalk')
const ora = require('ora')

/**
 * Enhanced logging system with multiple ora loaders for react-package-analyzer
 */
class Logger {
    constructor(options = {}) {
        this.options = {
            silent: false,
            debug: false,
            ...options
        }
        
        // Main spinner instance
        this.spinner = null
        
        // Track active spinners
        this.activeSpinners = new Map()
        
        // Only create pino logger if in debug mode
        if (this.options.debug) {
            this.pinoLogger = pino({
                level: 'debug',
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: true
                    }
                }
            })
        }
    }

    /**
   * Logs an info message in user-friendly format
   */
    info(message, data) {
        if (this.options.silent) return
        
        if (this.options.debug && this.pinoLogger) {
            this.pinoLogger.info(data || {}, message)
        } else {
            // Pause any active spinners
            this._pauseSpinners()
            console.log(`${chalk.blue('ℹ')} ${chalk.bold(message)}`)
            this._resumeSpinners()
        }
    }

    /**
   * Logs success message with green checkmark
   */
    success(message, data) {
        if (this.options.silent) return
        
        if (this.options.debug && this.pinoLogger) {
            this.pinoLogger.info(data || {}, `[SUCCESS] ${message}`)
        } else {
            this._pauseSpinners()
            console.log(`${chalk.green('✓')} ${message}`)
            this._resumeSpinners()
        }
    }

    /**
   * Logs warning message with yellow exclamation mark
   */
    warn(message, data) {
        // Always show warnings unless silent mode
        if (this.options.silent) return
        
        if (this.options.debug && this.pinoLogger) {
            this.pinoLogger.warn(data || {}, message)
        } else {
            this._pauseSpinners()
            console.log(`${chalk.yellow('⚠')} ${chalk.yellow(message)}`)
            this._resumeSpinners()
        }
    }

    /**
   * Logs error message with red X
   */
    error(message, error) {
        // Always show errors even in silent mode
        if (this.options.debug && this.pinoLogger) {
            this.pinoLogger.error({ error }, message)
        } else {
            this._pauseSpinners()
            console.error(`${chalk.red('✖')} ${chalk.red(message)}`)
            if (error && error.stack && this.options.debug) {
                console.error(chalk.dim(error.stack))
            } else if (error && error.message && !this.options.silent) {
                console.error(chalk.red(`  ${error.message}`))
            }
            this._resumeSpinners()
        }
    }

    /**
   * Logs debug message only in debug mode
   */
    debug(message, data) {
        if (this.options.debug && this.pinoLogger) {
            this.pinoLogger.debug(data || {}, message)
        }
    }

    /**
   * Helper to pause all active spinners
   */
    _pauseSpinners() {
        this.activeSpinners.forEach(spinner => {
            if (spinner.isSpinning) {
                spinner.stop()
            }
        })
    }

    /**
   * Helper to resume all active spinners
   */
    _resumeSpinners() {
        this.activeSpinners.forEach(spinner => {
            spinner.start()
        })
    }

    /**
   * Creates a file progress tracker with spinner
   */
    createFileProgressTracker(totalFiles) {
        if (this.options.silent || this.options.debug) {
            return {
                increment: () => {},
                complete: () => {},
                spinner: null
            }
        }
        
        let filesProcessed = 0
        
        const spinner = ora({
            text: `Scanning files: 0/${totalFiles}`,
            color: 'blue'
        }).start()
        
        // Register this spinner
        this.activeSpinners.set('fileProgress', spinner)
        
        return {
            increment: () => {
                filesProcessed++
                
                // Update only every 10 files to reduce flickering
                if (filesProcessed % 10 === 0 || filesProcessed === totalFiles) {
                    spinner.text = `Scanning files: ${filesProcessed}/${totalFiles}`
                }
            },
            complete: () => {
                spinner.succeed(`Scanned ${totalFiles} files`)
                this.activeSpinners.delete('fileProgress')
            },
            spinner
        }
    }

    /**
   * Creates a task spinner for any operation
   * @param {string} id - Unique identifier for the spinner
   * @param {string} text - Text to display
   * @param {Object} options - Additional options
   * @param {boolean} options.addNewLineAfter - Whether to add a newline after completion
   */
    createTask(id, text, options = {}) {
        if (this.options.silent || this.options.debug) {
            return {
                update: () => {},
                succeed: () => {},
                fail: () => {},
                spinner: null
            }
        }
        
        const spinner = ora({
            text,
            color: options.color || 'blue',
            spinner: options.spinner || 'dots'
        }).start()
        
        // Register this spinner
        this.activeSpinners.set(id, spinner)
        
        return {
            update: (newText) => spinner.text = newText,
            succeed: (text) => {
                spinner.succeed(text)
                this.activeSpinners.delete(id)
                
                // Add a newline after success if requested
                if (options.addNewLineAfter) {
                    console.log() // Empty console.log adds a newline
                }
            },
            fail: (text) => {
                spinner.fail(text)
                this.activeSpinners.delete(id)
                
                // Add a newline after failure if requested
                if (options.addNewLineAfter) {
                    console.log() // Empty console.log adds a newline
                }
            },
            spinner
        }
    }

    /**
   * Creates a multi-step progress tracker
   */
    createMultiStep(id, steps, options = {}) {
        if (this.options.silent || this.options.debug) {
            return {
                startStep: () => {},
                completeStep: () => {},
                failStep: () => {},
                complete: () => {}
            }
        }

        let currentStep = 0
        const totalSteps = steps.length
        const stepSpinner = ora({
            text: `${steps[0]} (1/${totalSteps})`,
            color: options.color || 'cyan',
            spinner: options.spinner || 'dots'
        }).start()
        
        // Register this spinner
        this.activeSpinners.set(id, stepSpinner)
        
        return {
            startStep: (index) => {
                if (index !== undefined) {
                    currentStep = index
                }
                stepSpinner.text = `${steps[currentStep]} (${currentStep+1}/${totalSteps})`
                stepSpinner.start()
            },
            completeStep: (message) => {
                const customMessage = message || `${steps[currentStep]} complete`
                stepSpinner.succeed(customMessage)
                
                currentStep++
                
                if (currentStep < totalSteps) {
                    stepSpinner.text = `${steps[currentStep]} (${currentStep+1}/${totalSteps})`
                    stepSpinner.start()
                }
            },
            failStep: (message) => {
                const customMessage = message || `${steps[currentStep]} failed`
                stepSpinner.fail(customMessage)
                
                currentStep++
                
                if (currentStep < totalSteps) {
                    stepSpinner.text = `${steps[currentStep]} (${currentStep+1}/${totalSteps})`
                    stepSpinner.start()
                }
            },
            complete: (message) => {
                stepSpinner.succeed(message || 'All steps completed')
                this.activeSpinners.delete(id)
            },
            spinner: stepSpinner
        }
    }

    // Add a method to log with a preceding newline
    directoryCreated(dir, path) {
        if (this.options.silent) return
        
        if (this.options.debug && this.pinoLogger) {
            this.pinoLogger.info({ dir, path }, `Created directory ${dir}`)
        } else {
            this._pauseSpinners()
            console.log() // Empty line before the message
            console.log(`Created ${dir} directory: ${path}`)
            this._resumeSpinners()
        }
    }
}

// Export a default instance
const logger = new Logger()

module.exports = {
    Logger,
    logger,
    createLogger: (options) => new Logger(options)
} 