/**
 * Utility functions for generating navigation elements across markdown reports
 */

/**
 * Generates a quick navigation section with links to the main report files
 * @param {string} basePath - The relative path prefix to use for links (e.g., '../../')
 * @returns {string} - Formatted markdown for the navigation section
 */
function generateMainNavigation(basePath = '') {
    const links = [
        { name: 'Main Page', file: 'index.md' },
        { name: 'Components', file: 'components.md' },
        { name: 'Files', file: 'files.md' },
        { name: 'Features', file: 'features.md' },
        { name: 'Hubs', file: 'hubs.md' }
    ]

    const sections = [
        '## Main Navigation',
        '',
        '| Report | Description |',
        '|--------|-------------|'
    ]

    // Create a row for each main report with descriptions
    links.forEach(link => {
        let description
    
        switch(link.name) {
        case 'Main Page':
            description = 'Dashboard and overview of all reports'
            break
        case 'Components':
            description = 'Detailed component usage statistics and insights'
            break
        case 'Files':
            description = 'Files and their component usage statistics'
            break
        case 'Features':
            description = 'Features and their component integration points'
            break
        case 'Hubs':
            description = 'Hub components and their dependency relationships'
            break
        default:
            description = ''
        }
    
        sections.push(`| [${link.name}](${basePath}${link.file}) | ${description} |`)
    })

    // Add a separator line and return link
    sections.push('')
    sections.push('---')
    sections.push('')

    return sections.join('\n')
}

/**
 * Generates a compact navigation bar for the top of report files
 * @param {string} basePath - The relative path prefix to use for links (e.g., '../../')
 * @param {string} currentPage - The name of the current page to highlight (optional)
 * @returns {string} - Formatted markdown for the navigation bar
 */
function generateCompactNavigation(basePath = '', currentPage = '') {
    const links = [
        { name: 'Home', file: 'index.md' },
        { name: 'Components', file: 'components.md' },
        { name: 'Files', file: 'files.md' },
        { name: 'Features', file: 'features.md' },
        { name: 'Hubs', file: 'hubs.md' }
    ]

    const navigationItems = links.map(link => {
        if (link.file.includes(currentPage)) {
            // Bold the current page
            return `**${link.name}**`
        } else {
            return `[${link.name}](${basePath}${link.file})`
        }
    })

    return `*Navigation: ${navigationItems.join(' | ')}*\n\n`
}

module.exports = {
    generateMainNavigation,
    generateCompactNavigation
}
