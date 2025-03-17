const { extractImportsFromContent } = require('../src/utils/importExtractor')

// Helper function to run tests
function runTest(testName, input, expectedImports, options = {}) {
    console.log(`Running test: ${testName}`)
    const actualImports = extractImportsFromContent(input, options)
    
    // Sort both arrays for consistent comparison
    const sortedActual = [...actualImports].sort()
    const sortedExpected = [...expectedImports].sort()
    
    try {
        // Check that all expected imports are contained in the actual imports
        const allExpectedFound = expectedImports.every(expected => 
            actualImports.includes(expected))
            
        if (!allExpectedFound) {
            const missing = expectedImports.filter(expected => 
                !actualImports.includes(expected))
                
            throw new Error(`Missing expected imports: ${JSON.stringify(missing)}`)
        }
        
        console.log(`✅ Test passed: ${testName}`)
        return true
    } catch (error) {
        console.error(`❌ Test failed: ${testName}`)
        console.error(`Expected (subset): ${JSON.stringify(sortedExpected)}`)
        console.error(`Actual: ${JSON.stringify(sortedActual)}`)
        console.error(error)
        return false
    }
}

// Run all tests
function runAllTests() {
    let passedCount = 0
    let totalCount = 0
    
    // Test 1: Standard ES module imports
    {
        const testName = 'Standard ES module imports'
        const input = `
            import React from 'react';
            import { useState, useEffect } from 'react';
            import Button from './components/Button';
            import { Card, CardHeader } from './components/Card/index';
        `
        const expected = ['./components/Button', './components/Card/index']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 2: CommonJS requires
    {
        const testName = 'CommonJS requires'
        const input = `
            const path = require('path');
            const { readFileSync } = require('fs');
            const myUtil = require('./utils/helper');
        `
        const expected = ['./utils/helper']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 3: Side effect imports
    {
        const testName = 'Side effect imports'
        const input = `
            import './styles.css';
            import 'bootstrap/dist/css/bootstrap.min.css';
        `
        const expected = ['./styles.css']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 4: Re-exports
    {
        const testName = 'Re-exports'
        const input = `
            export * from './utils';
            export { default as Button } from './components/Button';
        `
        const expected = ['./utils', './components/Button']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 5: Dynamic imports
    {
        const testName = 'Dynamic imports'
        const input = `
            function loadComponent() {
                return import('./components/LazyComponent');
            }
        `
        const expected = ['./components/LazyComponent']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 6: React.lazy imports with React namespace
    {
        const testName = 'React.lazy imports with React namespace'
        const input = `
            const LazyComponent = React.lazy(() => import('./components/LazyComponent'));
            const OtherComponent = React.lazy(() => import('./components/OtherComponent'));
        `
        const expected = ['./components/LazyComponent', './components/OtherComponent']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 7: React.lazy imports with destructured import
    {
        const testName = 'React.lazy imports with destructured import'
        const input = `
            import { lazy } from 'react';
            const LazyComponent = lazy(() => import('./components/LazyComponent'));
            const OtherComponent = lazy(param => import('./components/OtherComponent'));
        `
        const expected = ['./components/LazyComponent', './components/OtherComponent']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 8: Non-arrow function React.lazy
    {
        const testName = 'Non-arrow function React.lazy'
        const input = `
            import { lazy } from 'react';
            const LazyComponent = lazy(function() { return import('./components/LazyComponent'); });
        `
        const expected = ['./components/LazyComponent']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 9: Template literal imports - simple
    {
        const testName = 'Template literal imports - simple'
        const input = `
            const loadComponent = (name) => {
                return import(\`./components/\${name}\`);
            }
        `
        const expected = ['./components']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 10: Template literal imports - compound path
    {
        const testName = 'Template literal imports - compound path'
        const input = `
            const loadComponent = (name) => {
                return import(\`./components/forms/\${name}/index\`);
            }
        `
        const expected = ['./components/forms']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 11: Template literal imports - static path
    {
        const testName = 'Template literal imports - static path'
        const input = `
            const loadComponent = () => {
                return import(\`./components/StaticComponent\`);
            }
        `
        const expected = ['./components/StaticComponent']
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 12: Mixed imports with option to include external packages
    {
        const testName = 'Mixed imports with option to include external packages'
        const input = `
            import React from 'react';
            import Button from './components/Button';
            import axios from 'axios';
            const moment = require('moment');
            const utils = require('./utils');
        `
        const expected = ['react', 'axios', 'moment', './components/Button', './utils']
        const options = { includeExternalPackages: true }
        if (runTest(testName, input, expected, options)) passedCount++
        totalCount++
    }

    // Test 13: Complex React application with multiple import types
    {
        const testName = 'Complex React application with multiple import types'
        const input = `
            import React, { useState, useEffect, lazy, Suspense } from 'react';
            import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
            
            // Regular component imports
            import Header from './components/Header';
            import Footer from './components/Footer';
            import './styles/global.css';
            
            // Lazy loaded components
            const Dashboard = lazy(() => import('./pages/Dashboard'));
            const Profile = React.lazy(() => import('./pages/Profile'));
            const Settings = lazy(function() { return import('./pages/Settings'); });
            
            // Dynamic imports based on route
            const loadPage = (pageName) => {
                return import(\`./pages/\${pageName}/index\`);
            };
            
            export * from './utils/helpers';
        `
        const expected = [
            './components/Header',
            './components/Footer',
            './styles/global.css',
            './pages/Dashboard',
            './pages/Profile',
            './pages/Settings',
            './pages',
            './utils/helpers'
        ]
        if (runTest(testName, input, expected)) passedCount++
        totalCount++
    }

    // Test 14: Testing aliased imports
    {
        const testName = 'Testing aliased imports'
        const input = `
            import Button from '@components/Button';
            import { Card } from '~/ui/Card';
            import { loadPage } from '@utils/router';
            
            const LazyComponent = lazy(() => import('@pages/LazyComponent'));
        `
        const expected = ['@components/Button', '~/ui/Card', '@utils/router', '@pages/LazyComponent']
        const options = { includeExternalPackages: true }
        if (runTest(testName, input, expected, options)) passedCount++
        totalCount++
    }

    // Print summary
    console.log('\n=== Test Summary ===')
    console.log(`${passedCount} of ${totalCount} tests passed`)
    if (passedCount === totalCount) {
        console.log('✅ All tests passed successfully!')
    } else {
        console.log('❌ Some tests failed.')
    }

    return { passed: passedCount, total: totalCount }
}

// Run the tests
const results = runAllTests()

// Exit with appropriate code for CI integration
process.exit(results.passed === results.total ? 0 : 1) 