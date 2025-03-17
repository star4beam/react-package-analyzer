const fs = require('fs')
const path = require('path')
const { logger: defaultLogger } = require('../utils/logger')

/**
 * Analyzes imports and component usage in JavaScript/React files
 */
class ImportAnalyzer {
    constructor(config) {
        this.config = config
        this.componentMap = {}
        this.usageMap = {}
        this.imports = new Set()
        this.currentFile = null
        this.logger = config.logger || defaultLogger
        
        // Initialize usage map for each package
        this.config.packagesToTrack.forEach(pkg => {
            this.usageMap[pkg] = {}
        })
    }

    resolveImport(importString, currentFilePath) {
        // First check if it's an aliased path
        const lowerImport = importString.toLowerCase()
        for (const [alias, target] of Object.entries(this.config.aliasMap)) {
            const lowerAlias = alias.toLowerCase()
            if (lowerImport.startsWith(lowerAlias)) {
                const resolvedPath = target + importString.slice(alias.length)
                return resolvedPath.replace(/\\/g, '/')
            }
        }

        // Handle relative imports
        if (importString.startsWith('.')) {
            const absolutePath = path.resolve(
                path.dirname(currentFilePath),
                importString
            )
            return path.relative(process.cwd(), absolutePath)
                .replace(/\\/g, '/')
                .replace(/\.(js|jsx|ts|tsx)$/, '')
                .replace(/\/index$/, '')
        }

        return importString
    }

    analyzeFile(fileInfo, api) {
        try {
            const j = api.jscodeshift
            const root = j(fileInfo.source)
            this.currentFile = fileInfo.path
            this.imports.clear() // Clear imports for each file
            
            // Track ALL imports, skipping commented ones
            root.find(j.ImportDeclaration).forEach(path => {
                // Check if the node is within a comment
                const isCommented = path.node.comments && path.node.comments.length > 0

                // Skip if the import is commented
                if (isCommented) {
                    return
                }

                const importPath = path.node.source.value
                const resolvedPath = this.resolveImport(importPath, fileInfo.path)
                
                // Only add resolved paths that are local to the project
                if (!resolvedPath.startsWith('@') && 
                    !resolvedPath.startsWith('node_modules') && 
                    !resolvedPath.includes('..')) {
                    this.imports.add(resolvedPath)
                }
                
                // Check if the import path matches any of the packages to track
                if (Array.from(this.config.packagesToTrack).some(pkg => importPath === pkg)) {
                    this.processImport(path.node, importPath)
                }
            })

            // Track usage
            this.trackComponentUsage(root, j)

            // Save results only if we have tracked package usage
            const hasTrackedUsage = Object.values(this.usageMap).some(pkg => 
                Object.keys(pkg).length > 0
            )
            
            if (hasTrackedUsage) {
                return this.processResults(fileInfo.path)
            }
        } catch (error) {
            this.logger.error(`Error analyzing file ${fileInfo.path}`, error)
            throw error
        }
    }

    processImport(importNode, pkgName) {
        try {
            importNode.specifiers.forEach(specifier => {
                const importedName = specifier.imported?.name
                const localName = specifier.local?.name
                
                if (importedName && localName) {
                    this.componentMap[localName] = {
                        originalName: importedName,
                        package: pkgName
                    }

                    if (!this.usageMap[pkgName][importedName]) {
                        this.usageMap[pkgName][importedName] = {
                            imported: 1,
                            used: 0,
                            withClassName: 0,
                            withoutClassName: 0,
                            withStyle: 0,
                            withRef: 0,
                            withProps: 0,
                            totalUsage: 0
                        }
                    }
                }
            })
        } catch (error) {
            this.logger.error(`Error processing import in ${this.currentFile}`, error)
            throw error
        }
    }

    trackComponentUsage(root, j) {
        try {
            Object.entries(this.componentMap).forEach(([localName, info]) => {
                const { originalName, package: pkgName } = info
                
                // Ensure the component is initialized with props tracking
                if (!this.usageMap[pkgName][originalName].props) {
                    this.usageMap[pkgName][originalName].props = {
                        total: 0,
                        unique: new Set(),
                        details: {},
                        categories: {}
                    }
                }
                
                // Track JSX element usage - including both opening/closing and self-closing elements
                // This handles: <Button prop1="value" prop2={value} />
                const jsxElements = [
                    ...root.find(j.JSXElement, {
                        openingElement: { name: { name: localName } }
                    }).nodes(),
                    ...root.find(j.JSXOpeningElement, {
                        name: { name: localName },
                        selfClosing: true
                    }).nodes().map(node => ({ openingElement: node }))
                ]

                jsxElements.forEach(node => {
                    const usage = this.usageMap[pkgName][originalName]
                    usage.used++
                    usage.totalUsage++

                    // Get attributes from opening element
                    const attributes = node.openingElement.attributes || []
                    if (attributes.length > 0) {
                        this.analyzeAttributes(usage, attributes)
                    }
                    
                    // Check for children between tags (React's implicit children prop)
                    if (node.children && node.children.length > 0) {
                        // Mark that this component has children
                        if (!usage.withChildren) {
                            usage.withChildren = 0
                        }
                        usage.withChildren++
                        
                        // Also track it as a prop for consistency
                        if (!usage.props) {
                            usage.props = {
                                total: 0,
                                unique: new Set(),
                                details: {},
                                categories: {}
                            }
                        }
                        
                        usage.props.unique.add('children')
                        if (!usage.props.details['children']) {
                            usage.props.details['children'] = 0
                        }
                        usage.props.details['children']++
                        usage.props.total++
                        
                        // Track children types
                        if (!usage.childrenTypes) {
                            usage.childrenTypes = {}
                        }
                        
                        // Count different types of children
                        node.children.forEach(child => {
                            const childType = child.type || 'unknown'
                            if (!usage.childrenTypes[childType]) {
                                usage.childrenTypes[childType] = 0
                            }
                            usage.childrenTypes[childType]++
                        })
                    }
                })
                
                // Also track JSX elements with member expressions (e.g., Component.SubComponent)
                root.find(j.JSXOpeningElement, {
                    name: { 
                        type: 'JSXMemberExpression',
                        object: { name: localName }
                    }
                }).forEach(path => {
                    const usage = this.usageMap[pkgName][originalName]
                    usage.used++
                    usage.totalUsage++
                    
                    const attributes = path.node.attributes || []
                    this.analyzeAttributes(usage, attributes)
                })
                
                // Track function calls but don't process props from them
                root.find(j.CallExpression, {
                    callee: { name: localName }
                }).forEach(path => {
                    const usage = this.usageMap[pkgName][originalName]
                    usage.used++
                    usage.totalUsage++
                    
                    // Track function argument patterns (but not as props)
                    if (!usage.args) {
                        usage.args = { count: 0, patterns: {} }
                    }
                    
                    usage.args.count++
                    const argCount = path.node.arguments.length
                    const pattern = argCount === 0 ? 'noArgs' : 
                        argCount === 1 ? 'oneArg' : 'multipleArgs'
                    
                    if (!usage.args.patterns[pattern]) {
                        usage.args.patterns[pattern] = 0
                    }
                    usage.args.patterns[pattern]++
                })
            })
        } catch (error) {
            this.logger.error(`Error tracking component usage in ${this.currentFile}`, error)
            throw error
        }
    }

    // Add a helper method to categorize props
    categorizeProp(propName) {
        const categories = []
        const lowerPropName = propName.toLowerCase()
        // Create a set to track if this prop has been handled
        const handledProps = new Set()
        
        // Define category types with their associated props and patterns
        const categoryDefinitions = {
            // Event handling props
            eventHandler: {
                patterns: [/^on[A-Z]/], // onClick, onChange, onBlur, etc.
                exactMatch: []
            },
            
            // Accessibility related props
            accessibility: {
                patterns: [/^aria-/],
                exactMatch: ['role', 'tabIndex']
            },
            
            // Test-related attributes for QA automation
            testSelector: {
                patterns: [
                    /^data-testid/, /^data-test-id/, /^data-cy/, 
                    /^data-qa/, /^data-test/, /^data-uie/,
                    /^test-id/, /^testid/
                ],
                exactMatch: []
            },
            
            // Other data-attributes for custom functionality
            dataAttribute: {
                patterns: [/^data-/],
                exactMatch: [],
                excludeIfMatchedCategories: ['testSelector'] // Don't mark as dataAttribute if already a testSelector
            },
            
            // Styling-related props
            styling: {
                patterns: [],
                exactMatch: ['className', 'style'],
                alsoMatchesIfIncludes: ['style', 'className', 'css', 'theme']
            },
            
            // Size, dimension, and visual customization props
            customization: {
                patterns: [
                    /^(min|max)[A-Z]/, // minHeight, maxWidth, etc.
                    /Height$/i, /Width$/i, /Size$/i, /Color$/i,
                    /Margin$/i, /Padding$/i, /Spacing$/i,
                ],
                exactMatch: [
                    // Dimensions
                    'height', 'width', 'maxHeight', 'minHeight', 'maxWidth', 'minWidth',
                    // Size variants
                    'small', 'large', 'medium', 'sm', 'md', 'lg', 'xl', 'xs', 'size',
                    // Common UI customization
                    'color', 'variant', 'theme', 'appearance', 'mode',
                    // Positioning
                    'position', 'top', 'bottom', 'left', 'right',
                    // Spacing
                    'margin', 'padding', 'gap', 'spacing'
                ],
                alsoMatchesIfIncludes: ['color', 'background', 'align', 'direction', 'orientation']
            },
            
            // State control props
            stateControl: {
                patterns: [
                    /^is[A-Z]/, // isOpen, isActive, etc.
                    /^has[A-Z]/, // hasError, hasValue, etc.
                    /^show[A-Z]/, // showLabel, showIcon, etc.
                    /^hide[A-Z]/ // hideLabel, hideIcon, etc.
                ],
                exactMatch: [
                    // Form and input state
                    'value', 'defaultValue', 'checked', 'defaultChecked', 'selected',
                    'disabled', 'readOnly', 'required', 'active', 'clearable',
                    // Visibility states
                    'open', 'isOpen', 'closed', 'isClosed', 'hidden', 'isHidden',
                    'shown', 'isShown', 'visible', 'isVisible', 'toggled',
                    // Other states
                    'enabled', 'isEnabled', 'disabled', 'isDisabled', 'active', 
                    'isActive', 'selected', 'isSelected', 'checked', 'isChecked',
                    'focused', 'isFocused',
                    // Error states
                    'error', 'isError', 'hasError',
                    // Focus states
                    'autoFocus', 'focused', 'isFocused'
                ]
            },
            
            // Reference props
            reference: {
                patterns: [/Ref$/],
                exactMatch: ['ref', 'forwardedRef']
            },
            
            // Component composition props
            composition: {
                patterns: [/render[A-Z]/, /component$/i, /Component$/],
                exactMatch: ['children', 'render', 'component', 'as']
            },
            
            // Identification props
            identification: {
                patterns: [],
                exactMatch: ['id', 'key', 'name', 'htmlID']
            },
            
            // Loading and progress state props
            loadingState: {
                patterns: [/loading/i, /progress/i],
                exactMatch: ['loading', 'isLoading', 'progress', 'busy', 'isBusy']
            },
            
            // Form and component configuration props
            configuration: {
                patterns: [
                    /^label/i, // labelText, labelPosition, etc.
                    /Label$/i, // buttonLabel, headerLabel, etc.
                    /Placeholder$/i, /Title$/i, /Icon$/i, /Format$/i
                ],
                exactMatch: [
                    // Form attribute props
                    'type', 'format', 'max', 'min', 'maxLength', 'minLength', 'pattern',
                    // Text/visual props
                    'label', 'icon', 'title', 'description', 'placeholder',
                    // Input behavior
                    'autoComplete', 'htmlFor', 'readOnly', 'required'
                ],
                excludeIfMatchedCategories: ['customization'] // Prioritize as configuration over customization
            }
        }
        
        // Track matched categories to handle exclusions
        const matchedCategories = new Set()
        
        // We'll iterate in a specific order to prioritize categories
        // Order of processing determines priority (first match wins)
        const priorityOrder = [
            'eventHandler',      // Handle events first (clearly defined by on* pattern)
            'accessibility',     // Accessibility is critical and has specific patterns
            'testSelector',      // Testing selectors are clearly defined
            'dataAttribute',     // Other data attributes
            'reference',         // Refs are well-defined
            'composition',       // Component composition props like children
            'identification',    // IDs and keys
            'loadingState',      // Loading states
            'stateControl',      // Component state props
            'configuration',     // Configuration props
            'styling',           // Styling props
            'customization'      // Customization props (lowest priority)
        ]
        
        // Process categories in priority order
        for (const category of priorityOrder) {
            // Skip if we've already handled this prop
            if (handledProps.has(propName)) {
                break
            }
            
            const definition = categoryDefinitions[category]
            let matched = false
            
            // Check exact matches
            if (definition.exactMatch && definition.exactMatch.includes(propName)) {
                matched = true
            }
            
            // Check pattern matches
            if (!matched && definition.patterns) {
                for (const pattern of definition.patterns) {
                    if (pattern.test(propName)) {
                        matched = true
                        break
                    }
                }
            }
            
            // Check for included terms (partial matches)
            if (!matched && definition.alsoMatchesIfIncludes) {
                for (const term of definition.alsoMatchesIfIncludes) {
                    if (lowerPropName.includes(term.toLowerCase())) {
                        matched = true
                        break
                    }
                }
            }
            
            if (matched) {
                matchedCategories.add(category)
                handledProps.add(propName)
            }
        }
        
        // Handle exclusions (when a prop should be in one category but not another)
        Object.entries(categoryDefinitions).forEach(([category, definition]) => {
            if (matchedCategories.has(category) && definition.excludeIfMatchedCategories) {
                // If this category should be excluded when other categories match
                const shouldExclude = definition.excludeIfMatchedCategories.some(
                    excludeCategory => matchedCategories.has(excludeCategory)
                )
                
                if (shouldExclude) {
                    matchedCategories.delete(category)
                }
            }
        })
        
        // Convert the matched categories to an array
        Array.from(matchedCategories).forEach(category => {
            categories.push(category)
        })
        
        // If no specific category matched, mark as "other"
        if (categories.length === 0) {
            categories.push('other')
        }
        
        return categories
    }

    // Add a helper method for analyzing attributes
    analyzeAttributes(usage, attributes) {
        if (!usage.props) {
            usage.props = {
                total: 0,
                unique: new Set(),
                details: {},
                categories: {}
            }
        }
        
        // Initialize categories in props if not present
        if (!usage.props.categories) {
            usage.props.categories = {}
        }
        
        let hasClassName = false
        let hasStyle = false
        let hasRef = false
        let hasChildrenProp = false
        
        if (attributes.length > 0) {
            usage.withProps++
            
            attributes.forEach(attr => {
                if (attr.type === 'JSXAttribute') {
                    const propName = attr.name.name
                    usage.props.unique.add(propName)
                    
                    if (!usage.props.details[propName]) {
                        usage.props.details[propName] = 0
                    }
                    usage.props.details[propName]++
                    usage.props.total++
                    
                    // Categorize the prop
                    const categories = this.categorizeProp(propName)
                    categories.forEach(category => {
                        if (!usage.props.categories[category]) {
                            usage.props.categories[category] = {
                                count: 0,
                                props: {}
                            }
                        }
                        usage.props.categories[category].count++
                        if (!usage.props.categories[category].props[propName]) {
                            usage.props.categories[category].props[propName] = 0
                        }
                        usage.props.categories[category].props[propName]++
                    })
                    
                    // Existing specific prop tracking
                    if (propName === 'className') {
                        hasClassName = true
                        usage.withClassName = (usage.withClassName || 0) + 1
                        
                        // Try to extract the className value
                        if (attr.value && attr.value.type === 'StringLiteral') {
                            const classNames = attr.value.value.split(/\s+/).filter(Boolean)
                            if (!usage.classNames) {
                                usage.classNames = new Set()
                            }
                            classNames.forEach(cn => usage.classNames.add(cn))
                        }
                    } else if (propName === 'style') {
                        hasStyle = true
                        usage.withStyle = (usage.withStyle || 0) + 1
                    } else if (propName === 'ref') {
                        hasRef = true
                        usage.withRef = (usage.withRef || 0) + 1
                    } else if (propName === 'children') {
                        hasChildrenProp = true
                        if (!usage.withExplicitChildren) {
                            usage.withExplicitChildren = 0
                        }
                        usage.withExplicitChildren++
                    }
                    
                    // Track boolean props (props without value or with literal true/false)
                    if (!attr.value || 
                        (attr.value.type === 'JSXExpressionContainer' && 
                         attr.value.expression.type === 'BooleanLiteral')) {
                        if (!usage.booleanProps) {
                            usage.booleanProps = { count: 0, props: {} }
                        }
                        usage.booleanProps.count++
                        if (!usage.booleanProps.props[propName]) {
                            usage.booleanProps.props[propName] = 0
                        }
                        usage.booleanProps.props[propName]++
                    }
                    
                } else if (attr.type === 'JSXSpreadAttribute') {
                    // Handle spread props like {...rest}
                    // First, track general spread operator usage
                    // We'll track the fact that spread was used, but without special categorization
                    if (!usage.spreadUsage) {
                        usage.spreadUsage = { count: 0 }
                    }
                    usage.spreadUsage.count++
                    
                    // Enhanced: Try to extract props from inline object literals
                    // Handle cases like {...{propA: value, propB}}
                    if (attr.argument && 
                        attr.argument.type === 'ObjectExpression') {
                        
                        // Initialize a structure to track spread object properties if not exists
                        if (!usage.spreadObjectProps) {
                            usage.spreadObjectProps = {
                                count: 0,
                                props: {}
                            }
                        }
                        
                        // Process each property in the object expression
                        attr.argument.properties.forEach(prop => {
                            usage.spreadObjectProps.count++
                            
                            let propName
                            
                            // Handle different property types
                            if (prop.type === 'ObjectProperty' && prop.key) {
                                // For named properties like propA: value
                                propName = prop.key.name || prop.key.value
                            } else if (prop.type === 'SpreadElement') {
                                // For nested spreads like ...anotherObj
                                propName = 'nestedSpread'
                            } else if (prop.type === 'Identifier') {
                                // For shorthand properties like { propB }
                                propName = prop.name
                            }
                            
                            if (propName) {
                                // Add to unique props like regular props
                                usage.props.unique.add(propName)
                                
                                // Track in spreadObjectProps
                                if (!usage.spreadObjectProps.props[propName]) {
                                    usage.spreadObjectProps.props[propName] = 0
                                }
                                usage.spreadObjectProps.props[propName]++
                                
                                // Also track in the normal prop details
                                if (!usage.props.details[propName]) {
                                    usage.props.details[propName] = 0
                                }
                                usage.props.details[propName]++
                                usage.props.total++
                                
                                // Categorize the prop like normal props
                                const categories = this.categorizeProp(propName)
                                categories.forEach(category => {
                                    if (!usage.props.categories[category]) {
                                        usage.props.categories[category] = {
                                            count: 0,
                                            props: {}
                                        }
                                    }
                                    usage.props.categories[category].count++
                                    if (!usage.props.categories[category].props[propName]) {
                                        usage.props.categories[category].props[propName] = 0
                                    }
                                    usage.props.categories[category].props[propName]++
                                })
                            }
                        })
                    }
                    else {
                        // For dynamic spreads where we can't extract properties,
                        // just track that a spread was used without adding to categories
                        if (!usage.dynamicSpreadCount) {
                            usage.dynamicSpreadCount = 0
                        }
                        usage.dynamicSpreadCount++
                    }
                }
            })
            
            // Track co-occurrence of value/onChange (controlled components)
            const hasValue = attributes.some(attr => 
                attr.type === 'JSXAttribute' && attr.name.name === 'value')
            const hasOnChange = attributes.some(attr => 
                attr.type === 'JSXAttribute' && attr.name.name === 'onChange')
                
            if (hasValue && hasOnChange) {
                if (!usage.patterns) {
                    usage.patterns = { controlledComponent: 0 }
                } else if (!usage.patterns.controlledComponent) {
                    usage.patterns.controlledComponent = 0
                }
                usage.patterns.controlledComponent++
            }
            
            // Track defaultValue without onChange (uncontrolled components)
            const hasDefaultValue = attributes.some(attr => 
                attr.type === 'JSXAttribute' && attr.name.name === 'defaultValue')
                
            if (hasDefaultValue && !hasOnChange) {
                if (!usage.patterns) {
                    usage.patterns = { uncontrolledComponent: 0 }
                } else if (!usage.patterns.uncontrolledComponent) {
                    usage.patterns.uncontrolledComponent = 0
                }
                usage.patterns.uncontrolledComponent++
            }
            
            // Increment withoutClassName, withoutStyle, and withoutRef if component has
            // props but not these specific props
            if (!hasClassName) {
                usage.withoutClassName = (usage.withoutClassName || 0) + 1
            }
            
            if (!hasStyle) {
                usage.withoutStyle = (usage.withoutStyle || 0) + 1
            }
            
            if (!hasRef) {
                usage.withoutRef = (usage.withoutRef || 0) + 1
            }
            
            if (!hasChildrenProp) {
                if (!usage.withoutExplicitChildren) {
                    usage.withoutExplicitChildren = 0
                }
                usage.withoutExplicitChildren++
            }
        } else {
            // No props at all
            usage.withoutClassName = (usage.withoutClassName || 0) + 1
            usage.withoutStyle = (usage.withoutStyle || 0) + 1
            usage.withoutRef = (usage.withoutRef || 0) + 1
            
            if (!usage.withoutExplicitChildren) {
                usage.withoutExplicitChildren = 0
            }
            usage.withoutExplicitChildren++
        }
    }

    processResults(filePath) {
        // Create a relative path for the file based on the config base path
        // This ensures consistent paths regardless of where the file is located
        let relativeFilePath = path.relative(process.cwd(), filePath)
        
        // Track the file with a consistent path format
        // Use a normalized path to avoid duplicate entries
        const normalizedPath = relativeFilePath.replace(/\\/g, '/')
        
        // Calculate total prop count for the file
        let fileTotalProps = 0
        
        // For each component with usage, ensure its props structure is properly initialized
        // and calculate totals
        Object.values(this.usageMap).forEach(pkgUsage => {
            Object.values(pkgUsage).forEach(compUsage => {
                if (!compUsage.props) {
                    compUsage.props = {
                        total: 0,
                        unique: new Set(),
                        details: {},
                        categories: {}
                    }
                }
                
                // Sum up the total props for this file
                fileTotalProps += compUsage.props.total
                
                // Calculate withoutClassName for components that have props but no className
                if (compUsage.used > 0) {
                    if (compUsage.withClassName === undefined) {
                        compUsage.withClassName = 0
                    }
                    if (compUsage.withStyle === undefined) {
                        compUsage.withStyle = 0
                    }
                    if (compUsage.withRef === undefined) {
                        compUsage.withRef = 0
                    }
                    if (compUsage.withChildren === undefined) {
                        compUsage.withChildren = 0
                    }
                    if (compUsage.withExplicitChildren === undefined) {
                        compUsage.withExplicitChildren = 0
                    }
                    if (compUsage.withoutClassName === undefined) {
                        compUsage.withoutClassName = compUsage.used - (compUsage.withClassName || 0)
                    }
                    if (compUsage.withoutStyle === undefined) {
                        compUsage.withoutStyle = compUsage.used - (compUsage.withStyle || 0)
                    }
                    if (compUsage.withoutRef === undefined) {
                        compUsage.withoutRef = compUsage.used - (compUsage.withRef || 0)
                    }
                    if (compUsage.withoutExplicitChildren === undefined) {
                        compUsage.withoutExplicitChildren = compUsage.used - (compUsage.withExplicitChildren || 0)
                    }
                    if (compUsage.withProps === undefined) {
                        compUsage.withProps = 0
                    }
                    
                    // Total children usage combining both explicit and implicit
                    compUsage.totalChildrenUsage = (compUsage.withChildren || 0) + (compUsage.withExplicitChildren || 0)
                }
            })
        })
        
        this.logger.debug(`Processing file with normalized path: ${normalizedPath}, total props: ${fileTotalProps}`)
        
        const result = {
            file: normalizedPath,
            usage: this.usageMap,
            imports: Array.from(this.imports),
            totalProps: fileTotalProps
        }
        
        // Convert Sets to Arrays for JSON serialization
        Object.values(result.usage).forEach(pkgUsage => {
            Object.values(pkgUsage).forEach(componentUsage => {
                if (componentUsage.props?.unique) {
                    componentUsage.props.unique = Array.from(componentUsage.props.unique)
                }
                if (componentUsage.classNames) {
                    componentUsage.classNames = Array.from(componentUsage.classNames)
                }
            })
        })

        // Optional debug logging - count components with usage > 0
        const componentsWithUsage = Object.values(this.usageMap)
            .flatMap(pkgUsage => Object.entries(pkgUsage))
            .filter(([_, usage]) => usage.used > 0).length
            
        this.logger.debug(`Processed file: ${normalizedPath} - found ${componentsWithUsage} components with usage`, {
            componentsWithUsage,
            normalizedPath,
            totalProps: fileTotalProps
        })

        fs.appendFileSync(
            this.config.tempFilePath,
            `${JSON.stringify(result)}\n`,
            { encoding: 'utf8' }
        )
    }
}

module.exports = ImportAnalyzer 