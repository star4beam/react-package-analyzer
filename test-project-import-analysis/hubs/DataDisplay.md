# Hub: DataDisplay

*Navigation: [Home](../index.md) | [Components](../components.md) | [Files](../files.md) | [Features](../features.md) | **Hubs***

## Hub Overview

- **Hub Type**: Isolated
- **Path**: [src/components/common/DataDisplay.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/DataDisplay.jsx)
- **Used by Features**: 3
- **Total Dependency Paths**: 2
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

    hub_DataDisplay["DataDisplay"]
    class hub_DataDisplay currentHub

    %% Features that use this hub (directly or indirectly)
    subgraph Features["Features"]
        feature_AnalyticsDashboard["AnalyticsDashboard"]
        class feature_AnalyticsDashboard feature
        feature_SettingsPanel["SettingsPanel"]
        class feature_SettingsPanel feature
        feature_AdvancedPanel["AdvancedPanel"]
        class feature_AdvancedPanel feature
    end

    feature_AnalyticsDashboard --> hub_DataDisplay
    feature_SettingsPanel --> hub_DataDisplay
    feature_AdvancedPanel --> hub_DataDisplay
    %% Components directly used by this hub
    subgraph pkg__mui_material["@mui/material"]
        comp__mui_material_Typography["Typography"]
        class comp__mui_material_Typography component
        comp__mui_material_Divider["Divider"]
        class comp__mui_material_Divider component
    end
    hub_DataDisplay --> pkg__mui_material
    subgraph pkg__chakra_ui_react["@chakra-ui/react"]
        comp__chakra_ui_react_Stack["Stack"]
        class comp__chakra_ui_react_Stack component
        comp__chakra_ui_react_Box["Box"]
        class comp__chakra_ui_react_Box component
        comp__chakra_ui_react_Text["Text"]
        class comp__chakra_ui_react_Text component
    end
    hub_DataDisplay --> pkg__chakra_ui_react

    %% Direct hub-to-hub connections
```

## Features Using This Hub

| Feature | Path |
|---------|------|
| [AnalyticsDashboard](../features/AnalyticsDashboard.md) | [src/components/analytics/AnalyticsDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/analytics/AnalyticsDashboard.jsx) |
| [SettingsPanel](../features/SettingsPanel.md) | [src/components/settings/SettingsPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/settings/SettingsPanel.jsx) |
| [AdvancedPanel](../features/AdvancedPanel.md) | [src/components/ui/AdvancedPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/AdvancedPanel.jsx) |

## Hubs Using This Hub

No other hubs use this hub.

## Hubs This Hub Depends On

This hub does not depend on any other hubs.

## Components Used Indirectly

This section shows components used by other hubs that this hub depends on.

This hub does not use any components indirectly through other hubs.

## Components Used Directly

This section shows the components directly used by this hub from packages.

| Package | Components |
| ------- | ---------- |
| @chakra-ui/react | [Box](../components/@chakra-ui_react/Box.md), [Stack](../components/@chakra-ui_react/Stack.md), [Text](../components/@chakra-ui_react/Text.md) |
| @mui/material | [Divider](../components/@mui_material/Divider.md), [Typography](../components/@mui_material/Typography.md) |


