
*Navigation: [Home](../../index.md) | **Components** | [Files](../../files.md) | [Features](../../features.md) | [Hubs](../../hubs.md)*



# Box (@mui/material)

## Component Facts

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Component | Box | Package | @mui/material |
| Usage Count | 24 instances | Files | 15 files |
| Unique Props | 15 props | Prop Categories | 2 categories |
| Impact Score | 54 (Medium) | | |

### Impact Assessment

**Medium Impact Component**  
Primary factor: Usage frequency

This component has medium impact in your codebase. It&#x27;s used in several files and has moderate complexity. Changes should be made with care.

## Prop Usage Analysis

### Props by Category and Usage

| Category | Props | Usage Count |
|----------|-------|-------------|
| Other | `display` (6), `justifyContent` (5), `sx` (5), `mt` (4), `p` (4), `borderRadius` (2), `border` (1), `mb` (1) | 28 |
| Customization | `alignItems` (5), `height` (3), `minHeight` (1), `bgcolor` (1), `textAlign` (1), `gap` (1) | 12 |

## Prop Combinations

This section analyzes similar ways this component is configured across the codebase (75% similarity threshold).

### Pattern Group 1 (2 total usages)

**Base configuration**: `alignItems`, `children`, `display`, `height`, `justifyContent`

**Variations**:
- `alignItems`, `display`, `height`, `justifyContent` (1 uses, 80% similarity)


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
| [src/components/dashboard/Dashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/Dashboard.jsx) | `height`, `display`, `justifyContent`, `alignItems` | 2 |
| [src/components/common/LibrarySwitcher.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/LibrarySwitcher.jsx) | `sx`, `children` | 2 |
| [src/pages/auth/forms/SignupForm.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/auth/forms/SignupForm.jsx) | `children` | 1 |
| [src/components/ImportShowcase.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ImportShowcase.jsx) | `children` | 1 |
| [src/components/layouts/containers/Panel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/layouts/containers/Panel.jsx) | `children` | 1 |

### Co-located Components
Components that appear in the same files:

| Component | Package | Common Files |
|-----------|---------|--------------|
| [Typography](../@mui_material/Typography.md) | @mui/material | 8 |
| [Container](../@mui_material/Container.md) | @mui/material | 6 |
| [Paper](../@mui_material/Paper.md) | @mui/material | 6 |
| [Grid](../@mui_material/Grid.md) | @mui/material | 5 |
| [Stack](../@mui_material/Stack.md) | @mui/material | 5 |
