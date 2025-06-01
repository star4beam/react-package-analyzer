
# Feature: AnalyticsDashboard

*Navigation: [Home](../index.md) | [Components](../components.md) | [Files](../files.md) | **Features** | [Hubs](../hubs.md)*



## Feature Overview

- **Path**: [src/components/analytics/AnalyticsDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/analytics/AnalyticsDashboard.jsx)
- **Total Hubs Used**: 4

## Hub Dependencies Diagram

This diagram shows the hub relationships within this feature:

```mermaid
flowchart LR
    %% Node styles
    classDef feature stroke:#0078d7,stroke-width:2px
    classDef main stroke:#d04a02,stroke-width:2px
    classDef intermediate stroke:#7e6000,stroke-width:2px
    classDef base stroke:#006400,stroke-width:2px
    classDef isolated stroke:#333,stroke-width:1px,stroke-dasharray: 5 5

    %% Link styles
    linkStyle default stroke:#333,stroke-width:1px
    %% Use different arrow styles for dependency types
    %% Direct: solid line, Indirect: dashed line, Both: thick solid line

    feature_AnalyticsDashboard["AnalyticsDashboard"]
    class feature_AnalyticsDashboard feature

    subgraph BaseHubs["Base Hubs"]
        direction TB
        base_IntermediatePanel["IntermediatePanel"]
        class base_IntermediatePanel base
        base_BaseCard["BaseCard"]
        class base_BaseCard base
        base_BaseButton["BaseButton"]
        class base_BaseButton base
    end

    subgraph IsolatedHubs["Isolated Hubs"]
        direction TB
        isolated_DataDisplay["DataDisplay"]
        class isolated_DataDisplay isolated
    end

    feature_AnalyticsDashboard --> base_IntermediatePanel
    feature_AnalyticsDashboard --> isolated_DataDisplay
    feature_AnalyticsDashboard ==> base_BaseCard
    feature_AnalyticsDashboard ==> base_BaseButton

```

## Hub Dependencies



### Base

| Hub | Used By |
|-----|---------| 
| [BaseCard](../hubs/BaseCard.md) |  |
| [BaseButton](../hubs/BaseButton.md) |  |
| [IntermediatePanel](../hubs/IntermediatePanel.md) |  |


### Isolated Hubs

These hubs are used only within this feature and don't interact with other hubs.

| Hub | Packages |
|-----|----------|
| [DataDisplay](../hubs/DataDisplay.md) | @mui/material, @chakra-ui/react |


## Component Usage

| Package | Components |
|---------|------------|
| @mui/material | [Typography](../components/@mui_material/Typography.md), [Grid](../components/@mui_material/Grid.md), [Paper](../components/@mui_material/Paper.md), [Divider](../components/@mui_material/Divider.md), [Box](../components/@mui_material/Box.md), [Button](../components/@mui_material/Button.md) |
| @chakra-ui/react | [Container](../components/@chakra-ui_react/Container.md), [Box](../components/@chakra-ui_react/Box.md), [Heading](../components/@chakra-ui_react/Heading.md), [Text](../components/@chakra-ui_react/Text.md), [Card](../components/@chakra-ui_react/Card.md), [CardBody](../components/@chakra-ui_react/CardBody.md), [CardHeader](../components/@chakra-ui_react/CardHeader.md), [Button](../components/@chakra-ui_react/Button.md) |

