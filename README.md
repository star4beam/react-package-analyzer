# React Package Analyzer

A powerful tool for analyzing component usage patterns in React applications. This tool helps you track and understand how UI components from various libraries are used throughout your codebase, making migration planning, dependency management, and codebase analysis easier.

## Features

- Track component usage from multiple UI libraries simultaneously
- Detect import patterns and component distribution
- Generate detailed reports in JSON and Markdown formats
- Automatic detection of import aliases from jsconfig.json or tsconfig.json
- Dependency chain analysis to understand component relationships
- Library-agnostic design that works with any React UI component library

## Philosophy

React Package Analyzer is built on four core principles:

- **Library-agnostic**: Works with any React-based UI library
- **Application-agnostic**: Compatible with any React application structure
- **Usage-focused**: Analyzes how components are actually used in your codebase
- **Data-driven**: Provides objective metrics based on actual usage patterns

For a deeper exploration of these principles and the design philosophy behind this tool, see our [Core Philosophy](./CORE_PHILOSOPHY.md) document.

## Installation

```bash
npm install react-package-analyzer
```

## Usage

The React Package Analyzer is configured using a simple configuration file in your project root.

### 1. Create a configuration file

Create a file named `react-import-analyzer.config.js` in your project root:

```javascript
module.exports = {
    // UI libraries to analyze
    packagesToTrack: [
        '@mui/material',
        '@chakra-ui/react',
    ],
    
    // Output formats (json, markdown, or both)
    format: 'json,markdown',
    
    // GitHub repo URL for linking in reports (optional)
    repoUrl: 'https://github.com/username/project/blob/main',
    
    // Files to include in analysis
    include: 'src/**/*.{js,jsx,ts,tsx}',
    
    // Output directory for reports
    outputDir: './import-analysis'
}
```

### 2. Import aliases

The analyzer automatically detects import aliases from your `jsconfig.json` or `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@components/*": ["components/*"],
      "@pages/*": ["pages/*"],
      "@hooks/*": ["hooks/*"],
      "@utils/*": ["utils/*"],
      "@layouts/*": ["components/layouts/*"]
    }
  },
  "include": ["src"]
}
```

This allows the analyzer to correctly resolve imports that use aliases like:

```javascript
import { Button } from '@components/ui/Button';
```

### 3. Run the analyzer

After setting up your configuration file, simply run the following command from your project's root directory:

```bash
analyze-imports
```

The tool will automatically detect and use your `react-import-analyzer.config.js` file.

You can also specify a different configuration file:

```bash
analyze-imports --config custom-config.js
```

## Example project structure

Here's an example project structure showing where to place the configuration file:

```
my-react-app/
├── src/
│   ├── components/
│   ├── pages/
│   └── ...
├── jsconfig.json
├── react-import-analyzer.config.js
└── package.json
```

## Output

The analyzer generates several output files in your specified output directory:

- **raw.jsonl**: Detailed component usage data for each file
- **detailed.json**: Comprehensive statistics about component usage
- **summary.json**: High-level statistics about component usage
- **dependency-chains.json**: Maps relationships between files
- **import-intersections.json**: Analysis of component import relationships
- **report.md**: Human-readable markdown report of all findings

## Schema Documentation

For detailed information about the output file formats, please see the [schema documentation](schemas/).

## Documentation

- [Core Philosophy](./CORE_PHILOSOPHY.md) - Learn about the underlying principles and design decisions
- [Markdown Reports](./CORE_PHILOSOPHY.md#markdown-reports) - Detailed explanation of the generated markdown reports
- [Data Output](./CORE_PHILOSOPHY.md#data-output) - Comprehensive guide to the data files produced during analysis

## License

MIT
See [LICENSE](./LICENSE) for the full license text.

