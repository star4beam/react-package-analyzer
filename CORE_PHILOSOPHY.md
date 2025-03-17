# React Package Analyzer: Core Philosophy

## Core Philosophy

The React Package Analyzer is designed to provide comprehensive insights into how React components are used across any application. The tool is built on four fundamental principles:

### Library-agnostic
- The tool analyzes component usage patterns regardless of which UI libraries or frameworks are being used
- The tool avoids making assumptions about specific UI libraries or frameworks beyond React
- The tool doesn't favor or prioritize any particular component library in analysis
- All code and analysis work equally well with any React-based library
- The tool can track component usage from multiple UI libraries simultaneously

### Application-agnostic
- The analysis works for any React application regardless of its architecture or domain
- The tool doesn't make assumptions about application architecture or domain-specific patterns
- The tool is designed for compatibility with any React application structure
- The tool avoids hardcoding paths or structures that are specific to particular applications
- The tool automatically detects import aliases from jsconfig.json or tsconfig.json

### Usage-focused
- The tool prioritizes understanding how components are currently being used throughout the codebase
- The tool tracks component distribution, composition patterns, and impact on the application
- The analysis focuses on patterns of usage rather than prescribing specific changes
- The tool highlights relationships between components through dependency chains and import intersections
- The tool detects import patterns to provide insights into component distribution

### Data-driven
- All insights are derived from actual usage patterns found in the codebase
- The tool provides objective metrics and visualizations of component usage
- The analysis avoids making subjective judgments about component quality or design
- The tool presents comprehensive data through structured JSON outputs and detailed Markdown reports
- The tool generates reports in multiple formats (JSON and Markdown) for different use cases

## Data Output

The React Package Analyzer generates a comprehensive set of output files in the specified output directory, organized into data files and Markdown reports:

### Data Files

The tool produces a set of structured JSON and JSONL files in the `/data` directory that can be used for programmatic analysis:

1. **raw.jsonl**: Detailed component usage data for each file, with one JSON object per line, capturing all component import and usage instances
2. **detailed.json**: Comprehensive statistics about component usage across files and components, including prop usage and import patterns
3. **summary.json**: High-level statistics about component usage across the entire codebase, including total component counts, file counts, and usage counts per package
4. **dependency-chains.json**: Maps relationships between files that import components and their importers, showing how components flow through the application
5. **import-intersections.json**: Analysis of component import relationships and intersections between libraries, identifying where multiple UI libraries are used together

### Markdown Reports

The tool also generates a set of interconnected Markdown reports in the root of the output directory for human-readable analysis.

#### Markdown Report Structure

The Markdown reports are organized into a hierarchical structure of directories:

1. **index.md**: Dashboard view with summary statistics and links to detailed reports
2. **components.md**: Detailed component usage statistics and distribution patterns
3. **files.md**: Analysis of component usage organized by files in the codebase
4. **features.md**: Overview of features and their component integration points
5. **hubs.md**: Analysis of hub components (components with high usage or dependency counts)

Additionally, component reports are organized into the following directories:

- **components/**: Directory containing component library analyses
  - **{package name}**: Detailed reports on all components used from the specified package
    - **{component name}.md**: Detailed report on the specified component
- **features/**: Directory containing feature-specific component usage analyses
- **hubs/**: Directory containing analyses of hub components that serve as key integration points

Each directory contains individual Markdown files for specific components, features, or hubs, with detailed usage statistics, props analysis, and dependency information.

Each Markdown report includes navigation links to other reports, making it easy to explore the analysis from different perspectives. The reports also include visual representations (such as graphs and charts using Mermaid syntax) to illustrate component relationships and usage patterns.

Rather than prescribing specific actions or migrations, the analyzer focuses on presenting objective data about component usage, empowering teams to make informed decisions based on their specific requirements and constraints. This makes the tool valuable for migration planning, dependency management, and comprehensive codebase analysis.