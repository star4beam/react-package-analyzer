
*Navigation: [Home](../../index.md) | **Components** | [Files](../../files.md) | [Features](../../features.md) | [Hubs](../../hubs.md)*



# Box (@chakra-ui/react)

## Component Facts

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Component | Box | Package | @chakra-ui/react |
| Usage Count | 18 instances | Files | 12 files |
| Unique Props | 18 props | Prop Categories | 2 categories |
| Impact Score | 48 (Medium) | | |

### Impact Assessment

**Medium Impact Component**  
Primary factor: Prop complexity

This component has medium impact in your codebase. It&#x27;s used in several files and has moderate complexity. Changes should be made with care.

## Prop Usage Analysis

### Props by Category and Usage

| Category | Props | Usage Count |
|----------|-------|-------------|
| Other | `p` (5), `mt` (3), `mb` (3), `bg` (3), `display` (2), `justifyContent` (2), `borderRadius` (2), `boxShadow` (2), `borderBottom` (2), `overflow` (1), `flex` (1) | 26 |
| Customization | `borderColor` (3), `textAlign` (2), `borderWidth` (2), `minH` (1), `height` (1), `alignItems` (1) | 10 |

## Prop Combinations

This section analyzes similar ways this component is configured across the codebase (75% similarity threshold).

### Pattern Group 1 (2 total usages)

**Base configuration**: `bg`, `borderRadius`, `borderWidth`, `boxShadow`, `children`, `p`

**Variations**:
- `bg`, `borderColor`, `borderRadius`, `borderWidth`, `boxShadow`, `children`, `overflow`, `p` (1 uses, 75% similarity)


## Locations

### Component Usage Map

| File | Props Used | Prop Categories |
|------|------------|----------------|
| [src/pages/dashboard/DashboardPage.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/DashboardPage.jsx) | `minH`, `bg`, `children` | 3 |
| [src/pages/auth/Login.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/auth/Login.jsx) | `mb`, `children`, `mt`, `textAlign` | 3 |
| [src/components/ui/ChakraCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/ChakraCard.jsx) | `p`, `borderRadius`, `boxShadow`, `bg`, `borderWidth`, `children` | 3 |
| [src/components/ui/Card.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/Card.jsx) | `bg`, `borderWidth`, `borderColor`, `borderRadius`, `overflow`, `boxShadow`, `p`, `children` | 3 |
| [src/components/dashboard/Dashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/Dashboard.jsx) | `children`, `height`, `display`, `justifyContent`, `alignItems` | 3 |
| [src/components/dashboard/ActivityFeed.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/ActivityFeed.jsx) | `flex`, `children`, `mb`, `borderBottom`, `borderColor`, `mt`, `textAlign` | 3 |
| [src/pages/profile/ProfilePage.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/profile/ProfilePage.jsx) | `p`, `children`, `display`, `justifyContent`, `mt` | 2 |
| [src/pages/dashboard/EnhancedDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/EnhancedDashboard.jsx) | `mb`, `children` | 2 |
| [src/components/dashboard/StatsSummary.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/StatsSummary.jsx) | `p`, `children` | 2 |
| [src/components/common/ActionCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/ActionCard.jsx) | `p`, `children` | 2 |
| [src/components/dashboard/StatCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/StatCard.jsx) | `children` | 1 |

### Co-located Components
Components that appear in the same files:

| Component | Package | Common Files |
|-----------|---------|--------------|
| [Text](../@chakra-ui_react/Text.md) | @chakra-ui/react | 5 |
| [Container](../@mui_material/Container.md) | @mui/material | 4 |
| [Grid](../@mui_material/Grid.md) | @mui/material | 4 |
| [Heading](../@chakra-ui_react/Heading.md) | @chakra-ui/react | 4 |
| [Typography](../@mui_material/Typography.md) | @mui/material | 4 |
