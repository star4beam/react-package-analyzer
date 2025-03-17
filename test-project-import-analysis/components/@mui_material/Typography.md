
*Navigation: [Home](../../index.md) | **Components** | [Files](../../files.md) | [Features](../../features.md) | [Hubs](../../hubs.md)*



# Typography (@mui/material)

## Component Facts

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Component | Typography | Package | @mui/material |
| Usage Count | 14 instances | Files | 9 files |
| Unique Props | 7 props | Prop Categories | 3 categories |
| Impact Score | 31 (Low) | | |

### Impact Assessment

**Low Impact Component**  
Primary factor: Usage frequency

This component has relatively low impact in your codebase. It&#x27;s used in fewer files or has a simpler interface. Changes are less likely to cause widespread issues.

## Prop Usage Analysis

### Props by Category and Usage

| Category | Props | Usage Count |
|----------|-------|-------------|
| Customization | `variant` (9), `color` (1) | 10 |
| Other | `gutterBottom` (5), `paragraph` (3), `sx` (2) | 10 |
| Composition | `component` (5) | 5 |

## Prop Combinations

This section analyzes similar ways this component is configured across the codebase (75% similarity threshold).

### Pattern Group 1 (4 total usages)

**Base configuration**: `children`, `component`, `gutterBottom`, `paragraph`, `variant`

**Variations**:
- `children`, `component`, `gutterBottom`, `variant` (3 uses, 80% similarity)

### Pattern Group 2 (2 total usages)

**Base configuration**: `children`, `sx`, `variant`

**Variations**:
- `children`, `component`, `sx`, `variant` (1 uses, 75% similarity)


## Locations

### Component Usage Map

| File | Props Used | Prop Categories |
|------|------------|----------------|
| [src/pages/Home.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/Home.jsx) | `variant`, `component`, `gutterBottom`, `children`, `paragraph` | 3 |
| [src/pages/DynamicComponentDemo.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/DynamicComponentDemo.jsx) | `children`, `variant`, `component`, `gutterBottom` | 3 |
| [src/pages/dashboard/LazyDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/LazyDashboard.jsx) | `variant`, `component`, `gutterBottom`, `children` | 3 |
| [src/components/layouts/containers/Panel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/layouts/containers/Panel.jsx) | `variant`, `component`, `gutterBottom`, `children` | 3 |
| [src/components/dashboard/StatsSummary.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/StatsSummary.jsx) | `variant`, `sx`, `children` | 3 |
| [src/components/dashboard/StatCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/StatCard.jsx) | `variant`, `component`, `sx`, `children` | 3 |
| [src/components/dashboard/Dashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/Dashboard.jsx) | `variant`, `gutterBottom`, `children`, `color` | 3 |
| [src/components/dashboard/UserSummary.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/UserSummary.jsx) | `variant`, `children` | 2 |
| [src/components/dashboard/ActivityFeed.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/ActivityFeed.jsx) | `variant`, `children` | 2 |

### Co-located Components
Components that appear in the same files:

| Component | Package | Common Files |
|-----------|---------|--------------|
| [Box](../@mui_material/Box.md) | @mui/material | 8 |
| [Grid](../@mui_material/Grid.md) | @mui/material | 5 |
| [Container](../@mui_material/Container.md) | @mui/material | 4 |
| [Stack](../@mui_material/Stack.md) | @mui/material | 3 |
| [Paper](../@mui_material/Paper.md) | @mui/material | 3 |
