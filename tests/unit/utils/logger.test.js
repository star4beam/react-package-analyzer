const { Logger, logger, createLogger } = require('../../../src/utils/logger')

// Mock dependencies
jest.mock('pino', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
  return jest.fn(() => mockLogger)
})

jest.mock('ora', () => {
  const mockSpinner = {
    start: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    text: '',
    isSpinning: false
  }
  return jest.fn(() => mockSpinner)
})

jest.mock('chalk', () => ({
  blue: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text),
  bold: jest.fn(text => text),
  dim: jest.fn(text => text)
}))

describe('Logger', () => {
  let consoleLogSpy, consoleErrorSpy
  
  beforeEach(() => {
    jest.clearAllMocks()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('constructor', () => {
    test('should create logger with default options', () => {
      const testLogger = new Logger()
      
      expect(testLogger.options.silent).toBe(false)
      expect(testLogger.options.debug).toBe(false)
      expect(testLogger.activeSpinners).toBeInstanceOf(Map)
    })

    test('should create logger with custom options', () => {
      const testLogger = new Logger({ silent: true, debug: true })
      
      expect(testLogger.options.silent).toBe(true)
      expect(testLogger.options.debug).toBe(true)
    })

    test('should create pino logger only in debug mode', () => {
      const pino = require('pino')
      
      new Logger({ debug: false })
      expect(pino).not.toHaveBeenCalled()
      
      new Logger({ debug: true })
      expect(pino).toHaveBeenCalled()
    })
  })

  describe('info', () => {
    test('should log info message in normal mode', () => {
      const testLogger = new Logger()
      
      testLogger.info('Test message')
      
      expect(consoleLogSpy).toHaveBeenCalledWith('ℹ Test message')
    })

    test('should not log in silent mode', () => {
      const testLogger = new Logger({ silent: true })
      
      testLogger.info('Test message')
      
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    test('should use pino logger in debug mode', () => {
      const testLogger = new Logger({ debug: true })
      const mockPinoLogger = testLogger.pinoLogger
      
      testLogger.info('Test message', { data: 'test' })
      
      expect(mockPinoLogger.info).toHaveBeenCalledWith({ data: 'test' }, 'Test message')
    })
  })

  describe('success', () => {
    test('should log success message with checkmark', () => {
      const testLogger = new Logger()
      
      testLogger.success('Operation completed')
      
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ Operation completed')
    })

    test('should not log in silent mode', () => {
      const testLogger = new Logger({ silent: true })
      
      testLogger.success('Operation completed')
      
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('warn', () => {
    test('should log warning message with warning icon', () => {
      const testLogger = new Logger()
      
      testLogger.warn('Warning message')
      
      expect(consoleLogSpy).toHaveBeenCalledWith('⚠ Warning message')
    })

    test('should not log in silent mode', () => {
      const testLogger = new Logger({ silent: true })
      
      testLogger.warn('Warning message')
      
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('error', () => {
    test('should log error message with X icon', () => {
      const testLogger = new Logger()
      
      testLogger.error('Error message')
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('✖ Error message')
    })

    test('should always log errors even in silent mode', () => {
      const testLogger = new Logger({ silent: true })
      
      testLogger.error('Error message')
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('✖ Error message')
    })

    test('should log error with stack trace in debug mode', () => {
      const testLogger = new Logger({ debug: true })
      const mockPinoLogger = testLogger.pinoLogger
      const error = new Error('Test error')
      
      testLogger.error('Error occurred', error)
      
      expect(mockPinoLogger.error).toHaveBeenCalledWith({ error }, 'Error occurred')
    })

    test('should log error message in non-silent mode', () => {
      const testLogger = new Logger({ silent: false })
      const error = new Error('Test error')
      
      testLogger.error('Error occurred', error)
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('✖ Error occurred')
      expect(consoleErrorSpy).toHaveBeenCalledWith('  Test error')
    })
  })

  describe('debug', () => {
    test('should log debug message only in debug mode', () => {
      const testLogger = new Logger({ debug: true })
      const mockPinoLogger = testLogger.pinoLogger
      
      testLogger.debug('Debug message', { debug: 'data' })
      
      expect(mockPinoLogger.debug).toHaveBeenCalledWith({ debug: 'data' }, 'Debug message')
    })

    test('should not log debug message in normal mode', () => {
      const testLogger = new Logger({ debug: false })
      
      testLogger.debug('Debug message')
      
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('createFileProgressTracker', () => {
    test('should create progress tracker in normal mode', () => {
      const ora = require('ora')
      const testLogger = new Logger()
      
      const tracker = testLogger.createFileProgressTracker(100)
      
      expect(ora).toHaveBeenCalledWith({
        text: 'Scanning files: 0/100',
        color: 'blue'
      })
      expect(tracker.increment).toBeInstanceOf(Function)
      expect(tracker.complete).toBeInstanceOf(Function)
    })

    test('should return no-op tracker in silent mode', () => {
      const testLogger = new Logger({ silent: true })
      
      const tracker = testLogger.createFileProgressTracker(100)
      
      expect(tracker.spinner).toBeNull()
      expect(typeof tracker.increment).toBe('function')
      expect(typeof tracker.complete).toBe('function')
    })

    test('should update progress on increment', () => {
      const ora = require('ora')
      const mockSpinner = ora()
      const testLogger = new Logger()
      
      const tracker = testLogger.createFileProgressTracker(20)
      
      // Increment 10 times (should update on 10th)
      for (let i = 0; i < 10; i++) {
        tracker.increment()
      }
      
      expect(mockSpinner.text).toBe('Scanning files: 10/20')
    })

    test('should complete progress tracker', () => {
      const ora = require('ora')
      const mockSpinner = ora()
      const testLogger = new Logger()
      
      const tracker = testLogger.createFileProgressTracker(100)
      tracker.complete()
      
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Scanned 100 files')
    })
  })

  describe('createTask', () => {
    test('should create task spinner in normal mode', () => {
      const ora = require('ora')
      const testLogger = new Logger()
      
      const task = testLogger.createTask('test-task', 'Processing...')
      
      expect(ora).toHaveBeenCalledWith({
        text: 'Processing...',
        color: 'blue',
        spinner: 'dots'
      })
      expect(task.update).toBeInstanceOf(Function)
      expect(task.succeed).toBeInstanceOf(Function)
      expect(task.fail).toBeInstanceOf(Function)
    })

    test('should return no-op task in silent mode', () => {
      const testLogger = new Logger({ silent: true })
      
      const task = testLogger.createTask('test-task', 'Processing...')
      
      expect(task.spinner).toBeNull()
    })

    test('should update task text', () => {
      const ora = require('ora')
      const mockSpinner = ora()
      const testLogger = new Logger()
      
      const task = testLogger.createTask('test-task', 'Processing...')
      task.update('New text')
      
      expect(mockSpinner.text).toBe('New text')
    })

    test('should succeed task', () => {
      const ora = require('ora')
      const mockSpinner = ora()
      const testLogger = new Logger()
      
      const task = testLogger.createTask('test-task', 'Processing...')
      task.succeed('Done!')
      
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Done!')
    })

    test('should fail task', () => {
      const ora = require('ora')
      const mockSpinner = ora()
      const testLogger = new Logger()
      
      const task = testLogger.createTask('test-task', 'Processing...')
      task.fail('Failed!')
      
      expect(mockSpinner.fail).toHaveBeenCalledWith('Failed!')
    })
  })

  describe('createMultiStep', () => {
    const steps = ['Step 1', 'Step 2', 'Step 3']

    test('should create multi-step tracker in normal mode', () => {
      const ora = require('ora')
      const testLogger = new Logger()
      
      const multiStep = testLogger.createMultiStep('multi-task', steps)
      
      expect(ora).toHaveBeenCalledWith({
        text: 'Step 1 (1/3)',
        color: 'cyan',
        spinner: 'dots'
      })
      expect(multiStep.startStep).toBeInstanceOf(Function)
      expect(multiStep.completeStep).toBeInstanceOf(Function)
      expect(multiStep.failStep).toBeInstanceOf(Function)
      expect(multiStep.complete).toBeInstanceOf(Function)
    })

    test('should return no-op multi-step in silent mode', () => {
      const testLogger = new Logger({ silent: true })
      
      const multiStep = testLogger.createMultiStep('multi-task', steps)
      
      expect(typeof multiStep.startStep).toBe('function')
      expect(typeof multiStep.completeStep).toBe('function')
    })

    test('should progress through steps', () => {
      const ora = require('ora')
      const mockSpinner = ora()
      const testLogger = new Logger()
      
      const multiStep = testLogger.createMultiStep('multi-task', steps)
      
      multiStep.completeStep()
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Step 1 complete')
      expect(mockSpinner.text).toBe('Step 2 (2/3)')
      
      multiStep.completeStep('Custom message')
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Custom message')
      expect(mockSpinner.text).toBe('Step 3 (3/3)')
    })

    test('should handle step failures', () => {
      const ora = require('ora')
      const mockSpinner = ora()
      const testLogger = new Logger()
      
      const multiStep = testLogger.createMultiStep('multi-task', steps)
      
      multiStep.failStep('Custom failure')
      expect(mockSpinner.fail).toHaveBeenCalledWith('Custom failure')
      expect(mockSpinner.text).toBe('Step 2 (2/3)')
    })

    test('should complete all steps', () => {
      const ora = require('ora')
      const mockSpinner = ora()
      const testLogger = new Logger()
      
      const multiStep = testLogger.createMultiStep('multi-task', steps)
      multiStep.complete('All done!')
      
      expect(mockSpinner.succeed).toHaveBeenCalledWith('All done!')
    })
  })

  describe('directoryCreated', () => {
    test('should log directory creation', () => {
      const testLogger = new Logger()
      
      testLogger.directoryCreated('output', '/path/to/output')
      
      expect(consoleLogSpy).toHaveBeenCalledWith()
      expect(consoleLogSpy).toHaveBeenCalledWith('Created output directory: /path/to/output')
    })

    test('should not log in silent mode', () => {
      const testLogger = new Logger({ silent: true })
      
      testLogger.directoryCreated('output', '/path/to/output')
      
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('spinner management', () => {
    test('should pause and resume spinners', () => {
      const ora = require('ora')
      const mockSpinner = ora()
      mockSpinner.isSpinning = true
      
      const testLogger = new Logger()
      testLogger.createTask('test-task', 'Processing...')
      
      testLogger._pauseSpinners()
      expect(mockSpinner.stop).toHaveBeenCalled()
      
      testLogger._resumeSpinners()
      expect(mockSpinner.start).toHaveBeenCalled()
    })
  })

  describe('module exports', () => {
    test('should export Logger class', () => {
      expect(Logger).toBeInstanceOf(Function)
    })

    test('should export default logger instance', () => {
      expect(logger).toBeInstanceOf(Logger)
    })

    test('should export createLogger factory function', () => {
      const customLogger = createLogger({ debug: true })
      expect(customLogger).toBeInstanceOf(Logger)
      expect(customLogger.options.debug).toBe(true)
    })
  })
})