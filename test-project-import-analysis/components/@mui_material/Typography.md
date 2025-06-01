
*Navigation: [Home](../../index.md) | **Components** | [Files](../../files.md) | [Features](../../features.md) | [Hubs](../../hubs.md)*



# Typography (@mui/material)

## Component Facts

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Component | Typography | Package | @mui/material |
| Usage Count | 26 instances | Files | 19 files |
| Unique Props | 7 props | Prop Categories | 3 categories |
| Impact Score | 52 (Medium) | | |

### Impact Assessment

**Medium Impact Component**  
Primary factor: File distribution

This component has medium impact in your codebase. It&#x27;s used in several files and has moderate complexity. Changes should be made with care.

## Prop Usage Analysis

### Props by Category and Usage

| Category | Props | Usage Count |
|----------|-------|-------------|
| Customization | `variant` (21), `color` (2) | 23 |
| Other | `gutterBottom` (8), `paragraph` (3), `sx` (3) | 14 |
| Composition | `component` (7) | 7 |

## Prop Combinations

This section analyzes similar ways this component is configured across the codebase (75% similarity threshold).

### Pattern Group 1 (4 total usages)

**Base configuration**: `children`, `component`, `gutterBottom`, `paragraph`, `variant`

**Variations**:
- `children`, `component`, `gutterBottom`, `variant` (3 uses, 80% similarity)

### Pattern Group 2 (4 total usages)

**Base configuration**: `children`, `component`, `sx`, `variant`

**Variations**:
- `children`, `component`, `variant` (1 uses, 75% similarity)
- `children`, `sx`, `variant` (1 uses, 75% similarity)

### Pattern Group 3 (2 total usages)

**Base configuration**: `children`, `color`, `variant`

**Variations**:
- `children`, `color`, `gutterBottom`, `variant` (1 uses, 75% similarity)


## Locations

### Component Usage Map

| File | Props Used | Prop Categories |
|------|------------|----------------|
| [src/pages/Home.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/Home.jsx) | `variant`, `component`, `gutterBottom`, `children`, `paragraph` | 3 |
| [src/pages/DynamicComponentDemo.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/DynamicComponentDemo.jsx) | `children`, `variant`, `component`, `gutterBottom` | 3 |
| [src/pages/dashboard/LazyDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/LazyDashboard.jsx) | `variant`, `component`, `gutterBottom`, `children` | 3 |
| [src/components/layouts/MainLayout.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/layouts/MainLayout.jsx) | `variant`, `component`, `sx`, `children` | 3 |
| [src/components/layouts/containers/Panel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/layouts/containers/Panel.jsx) | `variant`, `component`, `gutterBottom`, `children` | 3 |
| [src/components/dashboard/StatsSummary.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/StatsSummary.jsx) | `variant`, `sx`, `children` | 3 |
| [src/components/dashboard/StatCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/StatCard.jsx) | `variant`, `component`, `sx`, `children` | 3 |
| [src/components/dashboard/Dashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/Dashboard.jsx) | `variant`, `gutterBottom`, `children`, `color` | 3 |
| [src/components/composite/ManagementHub.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/composite/ManagementHub.jsx) | `variant`, `gutterBottom`, `children` | 3 |
| [src/components/composite/AdminPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/composite/AdminPanel.jsx) | `variant`, `children`, `gutterBottom` | 3 |
| [src/components/ui/AdvancedPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/AdvancedPanel.jsx) | `variant`, `color`, `children` | 2 |
| [src/components/settings/SettingsPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/settings/SettingsPanel.jsx) | `variant`, `children` | 2 |
| [src/components/dashboard/UserSummary.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/UserSummary.jsx) | `variant`, `children` | 2 |
| [src/components/dashboard/MainDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/MainDashboard.jsx) | `variant`, `children` | 2 |
| [src/components/dashboard/ActivityFeed.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/ActivityFeed.jsx) | `variant`, `children` | 2 |
| [src/components/composite/DashboardHub.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/composite/DashboardHub.jsx) | `variant`, `children` | 2 |
| [src/components/common/DataDisplay.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/DataDisplay.jsx) | `variant`, `component`, `children` | 2 |
| [src/components/analytics/AnalyticsDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/analytics/AnalyticsDashboard.jsx) | `variant`, `children` | 2 |

### Co-located Components
Components that appear in the same files:

| Component | Package | Common Files |
|-----------|---------|--------------|
| [Box](../@mui_material/Box.md) | @mui/material | 17 |
| [Paper](../@mui_material/Paper.md) | @mui/material | 12 |
| [Text](../@chakra-ui_react/Text.md) | @chakra-ui/react | 10 |
| [Container](../@mui_material/Container.md) | @mui/material | 9 |
| [Heading](../@chakra-ui_react/Heading.md) | @chakra-ui/react | 9 |
