
*Navigation: [Home](../../index.md) | **Components** | [Files](../../files.md) | [Features](../../features.md) | [Hubs](../../hubs.md)*



# Box (@chakra-ui/react)

## Component Facts

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Component | Box | Package | @chakra-ui/react |
| Usage Count | 42 instances | Files | 20 files |
| Unique Props | 22 props | Prop Categories | 3 categories |
| Impact Score | 79 (Medium) | | |

### Impact Assessment

**Medium Impact Component**  
Primary factor: Usage frequency

This component has medium impact in your codebase. It&#x27;s used in several files and has moderate complexity. Changes should be made with care.

## Prop Usage Analysis

### Props by Category and Usage

| Category | Props | Usage Count |
|----------|-------|-------------|
| Other | `mt` (9), `p` (8), `display` (7), `bg` (3), `mb` (3), `borderRadius` (3), `borderBottom` (3), `justifyContent` (2), `boxShadow` (2), `overflow` (1), `flex` (1), `py` (1), `flexWrap` (1) | 44 |
| Customization | `gap` (5), `borderWidth` (3), `borderColor` (3), `minH` (2), `textAlign` (2), `height` (1), `alignItems` (1) | 17 |
| Identification | `key` (2) | 2 |

## Prop Combinations

This section analyzes similar ways this component is configured across the codebase (75% similarity threshold).

### Pattern Group 1 (4 total usages)

**Base configuration**: `children`, `display`, `gap`, `mt`

**Variations**:
- `children`, `display`, `gap`, `mt`, `p` (1 uses, 80% similarity)
- `children`, `display`, `gap` (1 uses, 75% similarity)

### Pattern Group 2 (2 total usages)

**Base configuration**: `bg`, `borderRadius`, `borderWidth`, `boxShadow`, `children`, `p`

**Variations**:
- `bg`, `borderColor`, `borderRadius`, `borderWidth`, `boxShadow`, `children`, `overflow`, `p` (1 uses, 75% similarity)


## Locations

### Component Usage Map

| File | Props Used | Prop Categories |
|------|------------|----------------|
| [src/components/common/DataDisplay.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/DataDisplay.jsx) | `key`, `p`, `borderWidth`, `borderRadius`, `children` | 4 |
| [src/components/analytics/AnalyticsDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/analytics/AnalyticsDashboard.jsx) | `mb`, `children`, `key`, `py`, `borderBottom`, `display`, `gap`, `flexWrap` | 4 |
| [src/pages/dashboard/EnhancedDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/EnhancedDashboard.jsx) | `children`, `display`, `gap`, `mt` | 3 |
| [src/pages/dashboard/DashboardPage.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/DashboardPage.jsx) | `minH`, `bg`, `children` | 3 |
| [src/pages/auth/Login.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/auth/Login.jsx) | `mb`, `children`, `mt`, `textAlign` | 3 |
| [src/components/ui/ChakraCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/ChakraCard.jsx) | `p`, `borderRadius`, `boxShadow`, `bg`, `borderWidth`, `children` | 3 |
| [src/components/ui/Card.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/Card.jsx) | `bg`, `borderWidth`, `borderColor`, `borderRadius`, `overflow`, `boxShadow`, `p`, `children` | 3 |
| [src/components/ui/AdvancedPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/AdvancedPanel.jsx) | `children`, `display`, `gap` | 3 |
| [src/components/settings/SettingsPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/settings/SettingsPanel.jsx) | `p`, `children`, `mt`, `display`, `gap` | 3 |
| [src/components/layouts/MainLayout.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/layouts/MainLayout.jsx) | `minH`, `children`, `mt` | 3 |
| [src/components/dashboard/Dashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/Dashboard.jsx) | `children`, `height`, `display`, `justifyContent`, `alignItems` | 3 |
| [src/components/dashboard/ActivityFeed.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/ActivityFeed.jsx) | `flex`, `children`, `mb`, `borderBottom`, `borderColor`, `mt`, `textAlign` | 3 |
| [src/components/composite/AdminPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/composite/AdminPanel.jsx) | `children`, `mt`, `display`, `gap` | 3 |
| [src/pages/profile/ProfilePage.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/profile/ProfilePage.jsx) | `p`, `children`, `display`, `justifyContent`, `mt` | 2 |
| [src/components/dashboard/StatsSummary.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/StatsSummary.jsx) | `p`, `children` | 2 |
| [src/components/composite/DashboardHub.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/composite/DashboardHub.jsx) | `p`, `children` | 2 |
| [src/components/common/ActionCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/ActionCard.jsx) | `p`, `children` | 2 |
| [src/components/ui/IntermediatePanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/IntermediatePanel.jsx) | `children` | 1 |
| [src/components/dashboard/StatCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/StatCard.jsx) | `children` | 1 |

### Co-located Components
Components that appear in the same files:

| Component | Package | Common Files |
|-----------|---------|--------------|
| [Typography](../@mui_material/Typography.md) | @mui/material | 12 |
| [Text](../@chakra-ui_react/Text.md) | @chakra-ui/react | 11 |
| [Paper](../@mui_material/Paper.md) | @mui/material | 9 |
| [Heading](../@chakra-ui_react/Heading.md) | @chakra-ui/react | 9 |
| [Container](../@mui_material/Container.md) | @mui/material | 8 |
