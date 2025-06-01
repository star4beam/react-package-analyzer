# Hub: BaseButton

*Navigation: [Home](../index.md) | [Components](../components.md) | [Files](../files.md) | [Features](../features.md) | **Hubs***

## Hub Overview

- **Hub Type**: Base
- **Path**: [src/components/ui/BaseButton.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/BaseButton.jsx)
- **Used by Features**: 6
- **Total Dependency Paths**: 0
- **Packages Used**: @mui/material, @chakra-ui/react

## Hub Relationships Diagram

```mermaid
flowchart LR
    %% Node styles
    classDef feature stroke:#0078d7,stroke-width:2px
    classDef currentHub stroke:#ffa500,stroke-width:3px
    classDef main stroke:#d04a02,stroke-width:2px
    classDef intermediate stroke:#7e6000,stroke-width:2px
    classDef base stroke:#006400,stroke-width:2px
    classDef component stroke:#006400,stroke-width:1px

    %% Link styles
    linkStyle default stroke:#333,stroke-width:1px
    %% Use different arrow styles for dependency types
    %% Direct: solid line, Indirect: dashed line, Both: thick solid line

    hub_BaseButton["BaseButton"]
    class hub_BaseButton currentHub

    %% Features that use this hub (directly or indirectly)
    subgraph Features["Features"]
        feature_AnalyticsDashboard["AnalyticsDashboard"]
        class feature_AnalyticsDashboard feature
        feature_ManagementHub["ManagementHub"]
        class feature_ManagementHub feature
        feature_MainDashboard["MainDashboard"]
        class feature_MainDashboard feature
        feature_SettingsPanel["SettingsPanel"]
        class feature_SettingsPanel feature
        feature_AdvancedPanel["AdvancedPanel"]
        class feature_AdvancedPanel feature
        feature_IntermediateForm["IntermediateForm"]
        class feature_IntermediateForm feature
    end

    feature_AnalyticsDashboard --> hub_BaseButton
    feature_ManagementHub --> hub_BaseButton
    feature_MainDashboard --> hub_BaseButton
    feature_SettingsPanel --> hub_BaseButton
    feature_AdvancedPanel --> hub_BaseButton
    feature_IntermediateForm --> hub_BaseButton
    feature_ManagementHub --> hub_IntermediateForm
    feature_MainDashboard --> hub_IntermediateForm
    feature_SettingsPanel --> hub_IntermediateForm
    %% Intermediate Hubs
    subgraph IntermediateHubs["Intermediate Hubs"]
        direction TB
        hub_IntermediateForm["IntermediateForm"]
        class hub_IntermediateForm intermediate
    end

    %% Main Hubs
    subgraph MainHubs["Main Hubs"]
        direction TB
        hub_ManagementHub["ManagementHub"]
        class hub_ManagementHub main
    end

    %% Components directly used by this hub
    subgraph pkg__mui_material["@mui/material"]
        comp__mui_material_Button["Button"]
        class comp__mui_material_Button component
    end
    hub_BaseButton --> pkg__mui_material
    subgraph pkg__chakra_ui_react["@chakra-ui/react"]
        comp__chakra_ui_react_Button["Button"]
        class comp__chakra_ui_react_Button component
    end
    hub_BaseButton --> pkg__chakra_ui_react

    %% Direct hub-to-hub connections
    hub_IntermediateForm --> hub_BaseButton
    hub_ManagementHub --> hub_BaseButton
    hub_ManagementHub --> hub_IntermediateForm
```

## Features Using This Hub

| Feature | Path |
|---------|------|
| [AnalyticsDashboard](../features/AnalyticsDashboard.md) | [src/components/analytics/AnalyticsDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/analytics/AnalyticsDashboard.jsx) |
| [ManagementHub](../features/ManagementHub.md) | [src/components/composite/ManagementHub.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/composite/ManagementHub.jsx) |
| [MainDashboard](../features/MainDashboard.md) | [src/components/dashboard/MainDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/MainDashboard.jsx) |
| [SettingsPanel](../features/SettingsPanel.md) | [src/components/settings/SettingsPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/settings/SettingsPanel.jsx) |
| [AdvancedPanel](../features/AdvancedPanel.md) | [src/components/ui/AdvancedPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/AdvancedPanel.jsx) |
| [IntermediateForm](../features/IntermediateForm.md) | [src/components/ui/IntermediateForm.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/IntermediateForm.jsx) |

## Hubs Using This Hub

| Hub | Path | Dependency Type |
|-----|------|----------------|
| [IntermediateForm](../hubs/IntermediateForm.md) | [src/components/ui/IntermediateForm.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/IntermediateForm.jsx) | direct |
| [ManagementHub](../hubs/ManagementHub.md) | [src/components/composite/ManagementHub.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/composite/ManagementHub.jsx) | both |

## Hubs This Hub Depends On

This hub does not depend on any other hubs.

## Components Used Indirectly

This section shows components used by other hubs that this hub depends on.

This hub does not use any components indirectly through other hubs.

## Components Used Directly

This section shows the components directly used by this hub from packages.

| Package | Components |
| ------- | ---------- |
| @chakra-ui/react | [Button](../components/@chakra-ui_react/Button.md) |
| @mui/material | [Button](../components/@mui_material/Button.md) |


