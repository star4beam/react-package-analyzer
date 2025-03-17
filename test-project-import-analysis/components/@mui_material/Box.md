
*Navigation: [Home](../../index.md) | **Components** | [Files](../../files.md) | [Features](../../features.md) | [Hubs](../../hubs.md)*



# Box (@mui/material)

## Component Facts

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Component | Box | Package | @mui/material |
| Usage Count | 14 instances | Files | 10 files |
| Unique Props | 14 props | Prop Categories | 2 categories |
| Impact Score | 39 (Low) | | |

### Impact Assessment

**Low Impact Component**  
Primary factor: Prop complexity

This component has relatively low impact in your codebase. It&#x27;s used in fewer files or has a simpler interface. Changes are less likely to cause widespread issues.

## Prop Usage Analysis

### Props by Category and Usage

| Category | Props | Usage Count |
|----------|-------|-------------|
| Other | `display` (4), `justifyContent` (4), `p` (4), `mt` (3), `borderRadius` (2), `sx` (2), `border` (1), `mb` (1) | 21 |
| Customization | `alignItems` (4), `height` (2), `minHeight` (1), `bgcolor` (1), `textAlign` (1) | 9 |

## Prop Combinations

This section analyzes similar ways this component is configured across the codebase (75% similarity threshold).

### Common Configurations

| Prop Combination | Usage Count | % of Total Uses |
|------------------|-------------|----------------|
| `children`, `sx` | 2 | 14.3% |
| `children` | 2 | 14.3% |
| `alignItems`, `children`, `display`, `height`, `justifyContent` | 1 | 7.1% |
| `children`, `mt` | 1 | 7.1% |
| `alignItems`, `border`, `borderRadius`, `children`, `display`, `justifyContent`, `minHeight`, `p` | 1 | 7.1% |
| `alignItems`, `bgcolor`, `borderRadius`, `children`, `display`, `height`, `justifyContent`, `mb`, `textAlign` | 1 | 7.1% |
| `children`, `p` | 1 | 7.1% |
| `alignItems`, `children`, `display`, `justifyContent`, `p` | 1 | 7.1% |

> **Flexibility Index: 57.1%** - This measures how many different ways the component is configured relative to its total usage. Higher numbers indicate more versatility.

## Locations

### Component Usage Map

| File | Props Used | Prop Categories |
|------|------------|----------------|
| [src/App.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/App.jsx) | `display`, `justifyContent`, `alignItems`, `height`, `children` | 3 |
| [src/pages/DynamicComponentDemo.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/DynamicComponentDemo.jsx) | `p`, `children`, `display`, `justifyContent`, `alignItems`, `minHeight`, `border`, `borderRadius` | 3 |
| [src/pages/dashboard/LazyDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/LazyDashboard.jsx) | `display`, `justifyContent`, `alignItems`, `height`, `bgcolor`, `borderRadius`, `children`, `textAlign`, `mb` | 3 |
| [src/hooks/custom/useDynamicComponent.js](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/hooks/custom/useDynamicComponent.js) | `display`, `justifyContent`, `alignItems`, `p`, `children` | 3 |
| [src/pages/Home.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/Home.jsx) | `mt`, `children` | 2 |
| [src/pages/dashboard/widgets/ChartWidget.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/widgets/ChartWidget.jsx) | `sx`, `children` | 2 |
| [src/pages/auth/Signup.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/auth/Signup.jsx) | `p`, `children` | 2 |
| [src/components/common/LibrarySwitcher.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/LibrarySwitcher.jsx) | `sx`, `children` | 2 |
| [src/pages/auth/forms/SignupForm.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/auth/forms/SignupForm.jsx) | `children` | 1 |
| [src/components/layouts/containers/Panel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/layouts/containers/Panel.jsx) | `children` | 1 |

### Co-located Components
Components that appear in the same files:

| Component | Package | Common Files |
|-----------|---------|--------------|
| [Container](../@mui_material/Container.md) | @mui/material | 4 |
| [Typography](../@mui_material/Typography.md) | @mui/material | 4 |
| [CircularProgress](../@mui_material/CircularProgress.md) | @mui/material | 3 |
| [Grid](../@mui_material/Grid.md) | @mui/material | 3 |
| [Stack](../@mui_material/Stack.md) | @mui/material | 2 |
