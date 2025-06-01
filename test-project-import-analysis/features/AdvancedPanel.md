
# Feature: AdvancedPanel

*Navigation: [Home](../index.md) | [Components](../components.md) | [Files](../files.md) | **Features** | [Hubs](../hubs.md)*



## Feature Overview

- **Path**: [src/components/ui/AdvancedPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/AdvancedPanel.jsx)
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

    feature_AdvancedPanel["AdvancedPanel"]
    class feature_AdvancedPanel feature

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

    feature_AdvancedPanel --> base_IntermediatePanel
    feature_AdvancedPanel --> isolated_DataDisplay
    feature_AdvancedPanel ==> base_BaseCard
    feature_AdvancedPanel ==> base_BaseButton

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
| @mui/material | [Paper](../components/@mui_material/Paper.md), [Typography](../components/@mui_material/Typography.md), [Chip](../components/@mui_material/Chip.md), [Box](../components/@mui_material/Box.md), [Button](../components/@mui_material/Button.md) |
| @chakra-ui/react | [Box](../components/@chakra-ui_react/Box.md), [VStack](../components/@chakra-ui_react/VStack.md), [Heading](../components/@chakra-ui_react/Heading.md), [Card](../components/@chakra-ui_react/Card.md), [CardBody](../components/@chakra-ui_react/CardBody.md), [CardHeader](../components/@chakra-ui_react/CardHeader.md), [Button](../components/@chakra-ui_react/Button.md) |

