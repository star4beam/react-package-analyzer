
*Navigation: [Home](../../index.md) | **Components** | [Files](../../files.md) | [Features](../../features.md) | [Hubs](../../hubs.md)*



# Button (@mui/material)

## Component Facts

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Component | Button | Package | @mui/material |
| Usage Count | 3 instances | Files | 4 files |
| Unique Props | 5 props | Prop Categories | 2 categories |
| Impact Score | 14 (Low) | | |

### Impact Assessment

**Low Impact Component**  
Primary factor: Prop complexity

This component has relatively low impact in your codebase. It&#x27;s used in fewer files or has a simpler interface. Changes are less likely to cause widespread issues.

## Prop Usage Analysis

### Props by Category and Usage

| Category | Props | Usage Count |
|----------|-------|-------------|
| Customization | `variant` (3), `color` (3), `size` (1) | 7 |
| **Event Handler** | **onClick** (1) | 1 |

## Prop Combinations

This section analyzes similar ways this component is configured across the codebase (75% similarity threshold).

### Pattern Group 1 (2 total usages)

**Base configuration**: `children`, `color`, `onClick`, `variant`

**Variations**:
- `children`, `color`, `variant` (1 uses, 75% similarity)


## Locations

### Component Usage Map

| File | Props Used | Prop Categories |
|------|------------|----------------|
| [src/pages/dashboard/LazyDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/LazyDashboard.jsx) | `variant`, `color`, `onClick`, `children` | 3 |
| [src/components/ui/AdaptiveButton.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/AdaptiveButton.jsx) | `variant`, `color`, `size`, `children` | 2 |
| [src/components/common/buttons/PrimaryButton.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/buttons/PrimaryButton.jsx) | `variant`, `color`, `children` | 2 |

### Co-located Components
Components that appear in the same files:

| Component | Package | Common Files |
|-----------|---------|--------------|
| [Container](../@mui_material/Container.md) | @mui/material | 1 |
| [Typography](../@mui_material/Typography.md) | @mui/material | 1 |
| [Grid](../@mui_material/Grid.md) | @mui/material | 1 |
| [Box](../@mui_material/Box.md) | @mui/material | 1 |
| [CircularProgress](../@mui_material/CircularProgress.md) | @mui/material | 1 |
