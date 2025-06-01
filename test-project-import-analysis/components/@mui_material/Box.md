
*Navigation: [Home](../../index.md) | **Components** | [Files](../../files.md) | [Features](../../features.md) | [Hubs](../../hubs.md)*



# Box (@mui/material)

## Component Facts

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Component | Box | Package | @mui/material |
| Usage Count | 20 instances | Files | 13 files |
| Unique Props | 15 props | Prop Categories | 2 categories |
| Impact Score | 48 (Medium) | | |

### Impact Assessment

**Medium Impact Component**  
Primary factor: Usage frequency

This component has medium impact in your codebase. It&#x27;s used in several files and has moderate complexity. Changes should be made with care.

## Prop Usage Analysis

### Props by Category and Usage

| Category | Props | Usage Count |
|----------|-------|-------------|
| Other | `display` (5), `sx` (5), `justifyContent` (4), `mt` (4), `p` (4), `borderRadius` (2), `border` (1), `mb` (1) | 26 |
| Customization | `alignItems` (4), `height` (2), `minHeight` (1), `bgcolor` (1), `textAlign` (1), `gap` (1) | 10 |

## Prop Combinations

This section analyzes similar ways this component is configured across the codebase (75% similarity threshold).

### Common Configurations

| Prop Combination | Usage Count | % of Total Uses |
|------------------|-------------|----------------|
| `children`, `sx` | 3 | 15.0% |
| `children` | 2 | 10.0% |
| `alignItems`, `children`, `display`, `height`, `justifyContent` | 1 | 5.0% |
| `children`, `mt` | 1 | 5.0% |
| `alignItems`, `border`, `borderRadius`, `children`, `display`, `justifyContent`, `minHeight`, `p` | 1 | 5.0% |
| `alignItems`, `bgcolor`, `borderRadius`, `children`, `display`, `height`, `justifyContent`, `mb`, `textAlign` | 1 | 5.0% |
| `children`, `p` | 1 | 5.0% |
| `alignItems`, `children`, `display`, `justifyContent`, `p` | 1 | 5.0% |
| `children`, `mt`, `sx` | 1 | 5.0% |
| `children`, `display`, `gap`, `sx` | 1 | 5.0% |

> **Flexibility Index: 50.0%** - This measures how many different ways the component is configured relative to its total usage. Higher numbers indicate more versatility.

## Locations

### Component Usage Map

| File | Props Used | Prop Categories |
|------|------------|----------------|
| [src/App.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/App.jsx) | `display`, `justifyContent`, `alignItems`, `height`, `children` | 3 |
| [src/pages/DynamicComponentDemo.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/DynamicComponentDemo.jsx) | `p`, `children`, `display`, `justifyContent`, `alignItems`, `minHeight`, `border`, `borderRadius` | 3 |
| [src/pages/dashboard/LazyDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/LazyDashboard.jsx) | `display`, `justifyContent`, `alignItems`, `height`, `bgcolor`, `borderRadius`, `children`, `textAlign`, `mb` | 3 |
| [src/hooks/custom/useDynamicComponent.js](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/hooks/custom/useDynamicComponent.js) | `display`, `justifyContent`, `alignItems`, `p`, `children` | 3 |
| [src/components/composite/ControlHub.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/composite/ControlHub.jsx) | `sx`, `children`, `display`, `gap` | 3 |
| [src/pages/Home.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/Home.jsx) | `mt`, `children` | 2 |
| [src/pages/dashboard/widgets/ChartWidget.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/widgets/ChartWidget.jsx) | `sx`, `children` | 2 |
| [src/pages/auth/Signup.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/auth/Signup.jsx) | `p`, `children` | 2 |
| [src/components/ui/BaseCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/BaseCard.jsx) | `sx`, `children` | 2 |
| [src/components/dashboard/MainDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/MainDashboard.jsx) | `sx`, `children`, `mt` | 2 |
| [src/components/common/LibrarySwitcher.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/LibrarySwitcher.jsx) | `sx`, `children` | 2 |
| [src/pages/auth/forms/SignupForm.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/auth/forms/SignupForm.jsx) | `children` | 1 |
| [src/components/layouts/containers/Panel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/layouts/containers/Panel.jsx) | `children` | 1 |

### Co-located Components
Components that appear in the same files:

| Component | Package | Common Files |
|-----------|---------|--------------|
| [Container](../@mui_material/Container.md) | @mui/material | 5 |
| [Typography](../@mui_material/Typography.md) | @mui/material | 5 |
| [Stack](../@mui_material/Stack.md) | @mui/material | 4 |
| [Paper](../@mui_material/Paper.md) | @mui/material | 4 |
| [CircularProgress](../@mui_material/CircularProgress.md) | @mui/material | 3 |
