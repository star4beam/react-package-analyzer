
# Feature: SettingsPanel

*Navigation: [Home](../index.md) | [Components](../components.md) | [Files](../files.md) | **Features** | [Hubs](../hubs.md)*



## Feature Overview

- **Path**: [src/components/settings/SettingsPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/settings/SettingsPanel.jsx)
- **Total Hubs Used**: 6

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

    feature_SettingsPanel["SettingsPanel"]
    class feature_SettingsPanel feature

    subgraph MainHubs["Main Hubs"]
        direction TB
        main_ManagementHub["ManagementHub"]
        class main_ManagementHub main
    end

    subgraph IntermediateHubs["Intermediate Hubs"]
        direction TB
        intermediate_IntermediateForm["IntermediateForm"]
        class intermediate_IntermediateForm intermediate
    end

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

    feature_SettingsPanel --> main_ManagementHub
    feature_SettingsPanel ==> intermediate_IntermediateForm
    feature_SettingsPanel ==> base_IntermediatePanel
    feature_SettingsPanel --> isolated_DataDisplay
    feature_SettingsPanel ==> base_BaseCard
    feature_SettingsPanel ==> base_BaseButton
    main_ManagementHub --> base_IntermediatePanel
    main_ManagementHub --> intermediate_IntermediateForm
    main_ManagementHub ==> base_BaseButton
    intermediate_IntermediateForm --> base_BaseCard
    intermediate_IntermediateForm --> base_BaseButton

```

## Hub Dependencies

### Main

| Hub | Dependencies |
|-----|-------------|
| [ManagementHub](../hubs/ManagementHub.md) | [IntermediatePanel](../hubs/IntermediatePanel.md), [BaseCard](../hubs/BaseCard.md), [IntermediateForm](../hubs/IntermediateForm.md), [BaseButton](../hubs/BaseButton.md) |


### Intermediate *

<a name="intermediate"></a>

| Hub | Used By | Depends On |
|-----|---------|------------|
| [IntermediateForm](../hubs/IntermediateForm.md) | [ManagementHub](../hubs/ManagementHub.md) | [BaseCard](../hubs/BaseCard.md), [BaseButton](../hubs/BaseButton.md) |


### Base

| Hub | Used By |
|-----|---------| 
| [BaseCard](../hubs/BaseCard.md) | [IntermediateForm](../hubs/IntermediateForm.md), [ManagementHub](../hubs/ManagementHub.md) |
| [BaseButton](../hubs/BaseButton.md) | [IntermediateForm](../hubs/IntermediateForm.md), [ManagementHub](../hubs/ManagementHub.md) |
| [IntermediatePanel](../hubs/IntermediatePanel.md) | [ManagementHub](../hubs/ManagementHub.md) |


### Isolated Hubs

These hubs are used only within this feature and don't interact with other hubs.

| Hub | Packages |
|-----|----------|
| [DataDisplay](../hubs/DataDisplay.md) | @mui/material, @chakra-ui/react |


## Component Usage

| Package | Components |
|---------|------------|
| @mui/material | [Typography](../components/@mui_material/Typography.md), [Switch](../components/@mui_material/Switch.md), [FormControlLabel](../components/@mui_material/FormControlLabel.md), [Paper](../components/@mui_material/Paper.md), [Chip](../components/@mui_material/Chip.md), [Divider](../components/@mui_material/Divider.md), [TextField](../components/@mui_material/TextField.md), [Paper](../components/@mui_material/Paper.md), [Box](../components/@mui_material/Box.md), [Button](../components/@mui_material/Button.md) |
| @chakra-ui/react | [Box](../components/@chakra-ui_react/Box.md), [SimpleGrid](../components/@chakra-ui_react/SimpleGrid.md), [Heading](../components/@chakra-ui_react/Heading.md), [VStack](../components/@chakra-ui_react/VStack.md), [Text](../components/@chakra-ui_react/Text.md), [Stack](../components/@chakra-ui_react/Stack.md), [Box](../components/@chakra-ui_react/Box.md), [VStack](../components/@chakra-ui_react/VStack.md), [FormControl](../components/@chakra-ui_react/FormControl.md), [FormLabel](../components/@chakra-ui_react/FormLabel.md), [Card](../components/@chakra-ui_react/Card.md), [CardBody](../components/@chakra-ui_react/CardBody.md), [CardHeader](../components/@chakra-ui_react/CardHeader.md), [Button](../components/@chakra-ui_react/Button.md) |

