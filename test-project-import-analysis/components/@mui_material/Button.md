
*Navigation: [Home](../../index.md) | **Components** | [Files](../../files.md) | [Features](../../features.md) | [Hubs](../../hubs.md)*



# Button (@mui/material)

## Component Facts

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Component | Button | Package | @mui/material |
| Usage Count | 7 instances | Files | 7 files |
| Unique Props | 5 props | Prop Categories | 2 categories |
| Impact Score | 21 (Low) | | |

### Impact Assessment

**Low Impact Component**  
Primary factor: File distribution

This component has relatively low impact in your codebase. It&#x27;s used in fewer files or has a simpler interface. Changes are less likely to cause widespread issues.

## Prop Usage Analysis

### Props by Category and Usage

| Category | Props | Usage Count |
|----------|-------|-------------|
| Customization | `variant` (7), `color` (4), `size` (1) | 12 |
| **Event Handler** | **onClick** (1) | 1 |

## Prop Combinations

This section analyzes similar ways this component is configured across the codebase (75% similarity threshold).

### Pattern Group 1 (3 total usages)

**Base configuration**: `children`, `color`, `onClick`, `variant`

**Variations**:
- `children`, `color`, `variant` (2 uses, 75% similarity)


## Locations

### Component Usage Map

| File | Props Used | Prop Categories |
|------|------------|----------------|
| [src/pages/dashboard/LazyDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/pages/dashboard/LazyDashboard.jsx) | `variant`, `color`, `onClick`, `children` | 3 |
| [src/components/ImportShowcase.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ImportShowcase.jsx) | `variant`, `children` | 2 |
| [src/components/ui/BaseButton.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/BaseButton.jsx) | `variant`, `children` | 2 |
| [src/components/ui/AdaptiveButton.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/AdaptiveButton.jsx) | `variant`, `color`, `size`, `children` | 2 |
| [src/components/composite/AdminPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/composite/AdminPanel.jsx) | `variant`, `color`, `children` | 2 |
| [src/components/common/buttons/PrimaryButton.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/buttons/PrimaryButton.jsx) | `variant`, `color`, `children` | 2 |

### Co-located Components
Components that appear in the same files:

| Component | Package | Common Files |
|-----------|---------|--------------|
| [Box](../@mui_material/Box.md) | @mui/material | 4 |
| [Typography](../@mui_material/Typography.md) | @mui/material | 3 |
| [Container](../@mui_material/Container.md) | @mui/material | 2 |
| [Grid](../@mui_material/Grid.md) | @mui/material | 2 |
| [Paper](../@mui_material/Paper.md) | @mui/material | 2 |
