const { extractImportsFromContent } = require('../../../src/utils/importExtractor')

describe('importExtractor', () => {
  describe('extractImportsFromContent', () => {
    test('should extract standard ES module imports', () => {
      const input = `
        import React from 'react';
        import { useState, useEffect } from 'react';
        import Button from './components/Button';
        import { Card, CardHeader } from './components/Card/index';
      `
      const expected = ['./components/Button', './components/Card/index']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should extract CommonJS requires', () => {
      const input = `
        const path = require('path');
        const { readFileSync } = require('fs');
        const myUtil = require('./utils/helper');
      `
      const expected = ['./utils/helper']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should extract side effect imports', () => {
      const input = `
        import './styles.css';
        import 'bootstrap/dist/css/bootstrap.min.css';
      `
      const expected = ['./styles.css']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should extract re-exports', () => {
      const input = `
        export * from './utils';
        export { default as Button } from './components/Button';
      `
      const expected = ['./utils', './components/Button']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should extract dynamic imports', () => {
      const input = `
        function loadComponent() {
          return import('./components/LazyComponent');
        }
      `
      const expected = ['./components/LazyComponent']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should extract React.lazy imports with React namespace', () => {
      const input = `
        const LazyComponent = React.lazy(() => import('./components/LazyComponent'));
        const OtherComponent = React.lazy(() => import('./components/OtherComponent'));
      `
      const expected = ['./components/LazyComponent', './components/OtherComponent']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should extract React.lazy imports with destructured import', () => {
      const input = `
        import { lazy } from 'react';
        const LazyComponent = lazy(() => import('./components/LazyComponent'));
        const OtherComponent = lazy(param => import('./components/OtherComponent'));
      `
      const expected = ['./components/LazyComponent', './components/OtherComponent']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should extract non-arrow function React.lazy', () => {
      const input = `
        import { lazy } from 'react';
        const LazyComponent = lazy(function() { return import('./components/LazyComponent'); });
      `
      const expected = ['./components/LazyComponent']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should extract template literal imports - simple', () => {
      const input = `
        const loadComponent = (name) => {
          return import(\`./components/\${name}\`);
        }
      `
      const expected = ['./components']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should extract template literal imports - compound path', () => {
      const input = `
        const loadComponent = (name) => {
          return import(\`./components/forms/\${name}/index\`);
        }
      `
      const expected = ['./components/forms']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should extract template literal imports - static path', () => {
      const input = `
        const loadComponent = () => {
          return import(\`./components/StaticComponent\`);
        }
      `
      const expected = ['./components/StaticComponent']
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should handle mixed imports with option to include external packages', () => {
      const input = `
        import React from 'react';
        import Button from './components/Button';
        import axios from 'axios';
        const moment = require('moment');
        const utils = require('./utils');
      `
      const expected = ['react', 'axios', 'moment', './components/Button', './utils']
      const options = { includeExternalPackages: true }
      const result = extractImportsFromContent(input, options)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should handle complex React application with multiple import types', () => {
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
      const result = extractImportsFromContent(input)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should handle aliased imports', () => {
      const input = `
        import Button from '@components/Button';
        import { Card } from '~/ui/Card';
        import { loadPage } from '@utils/router';
        
        const LazyComponent = lazy(() => import('@pages/LazyComponent'));
      `
      const expected = ['@components/Button', '~/ui/Card', '@utils/router', '@pages/LazyComponent']
      const options = { includeExternalPackages: true }
      const result = extractImportsFromContent(input, options)
      
      expected.forEach(imp => {
        expect(result).toContain(imp)
      })
    })

    test('should filter out external packages by default', () => {
      const input = `
        import React from 'react';
        import axios from 'axios';
        import Button from './components/Button';
      `
      
      const result = extractImportsFromContent(input)
      
      expect(result).toContain('./components/Button')
      expect(result).not.toContain('react')
      expect(result).not.toContain('axios')
    })

    test('should handle empty input', () => {
      const result = extractImportsFromContent('')
      expect(result).toEqual([])
    })

    test('should handle input with no imports', () => {
      const input = `
        const a = 1;
        const b = 2;
        console.log(a + b);
      `
      const result = extractImportsFromContent(input)
      expect(result).toEqual([])
    })

    test('should handle commented imports', () => {
      const input = `
        // import React from 'react';
        /* import axios from 'axios'; */
        import Button from './components/Button';
      `
      const result = extractImportsFromContent(input)
      
      expect(result).toContain('./components/Button')
      // The actual behavior depends on the implementation
      // Most parsers would ignore commented imports
    })

    test('should handle imports in different formats', () => {
      const input = `
        import React from 'react'
        import { Component } from "react";
        import Button from './Button'
      `
      const result = extractImportsFromContent(input)
      
      expect(result).toContain('./Button')
    })

    test('should handle mixed quote styles', () => {
      const input = `
        import React from "react";
        import Button from './components/Button';
        import { Card } from "./components/Card";
      `
      const result = extractImportsFromContent(input)
      
      expect(result).toContain('./components/Button')
      expect(result).toContain('./components/Card')
    })
  })
})