
# Feature: UserSummary

*Navigation: [Home](../index.md) | [Components](../components.md) | [Files](../files.md) | **Features** | [Hubs](../hubs.md)*



## Feature Overview

- **Path**: [src/components/dashboard/UserSummary.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/UserSummary.jsx)
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

    feature_UserSummary["UserSummary"]
    class feature_UserSummary feature

    subgraph IsolatedHubs["Isolated Hubs"]
        direction TB
        isolated_ActionCard["ActionCard"]
        class isolated_ActionCard isolated
        isolated_InfoPanel["InfoPanel"]
        class isolated_InfoPanel isolated
        isolated_Button["Button"]
        class isolated_Button isolated
        isolated_ChakraCard["ChakraCard"]
        class isolated_ChakraCard isolated
        isolated_ChakraButton["ChakraButton"]
        class isolated_ChakraButton isolated
        isolated_Card["Card"]
        class isolated_Card isolated
    end

    feature_UserSummary --> isolated_ActionCard
    feature_UserSummary --> isolated_InfoPanel
    feature_UserSummary ==> isolated_Button
    feature_UserSummary ==> isolated_ChakraCard
    feature_UserSummary ==> isolated_ChakraButton
    feature_UserSummary --> isolated_Card

```

## Hub Dependencies




### Isolated Hubs

These hubs are used only within this feature and don't interact with other hubs.

| Hub | Packages |
|-----|----------|
| [ActionCard](../hubs/ActionCard.md) | @mui/material, @chakra-ui/react |
| [InfoPanel](../hubs/InfoPanel.md) | @chakra-ui/react |
| [Button](../hubs/Button.md) | @mui/material |
| [ChakraCard](../hubs/ChakraCard.md) | @chakra-ui/react |
| [ChakraButton](../hubs/ChakraButton.md) | @chakra-ui/react |
| [Card](../hubs/Card.md) | @chakra-ui/react |


## Component Usage

| Package | Components |
|---------|------------|
| @mui/material | [Paper](../components/@mui_material/Paper.md), [Avatar](../components/@mui_material/Avatar.md), [Typography](../components/@mui_material/Typography.md), [Button](../components/@mui_material/Button.md), [styled](../components/@mui_material/styled.md), [Icon](../components/@mui_material/Icon.md) |
| @chakra-ui/react | [Stack](../components/@chakra-ui_react/Stack.md), [Box](../components/@chakra-ui_react/Box.md), [useColorModeValue](../components/@chakra-ui_react/useColorModeValue.md), [Divider](../components/@chakra-ui_react/Divider.md), [Box](../components/@chakra-ui_react/Box.md), [Heading](../components/@chakra-ui_react/Heading.md), [Text](../components/@chakra-ui_react/Text.md), [Button](../components/@chakra-ui_react/Button.md) |

