# Hub: Card

*Navigation: [Home](../index.md) | [Components](../components.md) | [Files](../files.md) | [Features](../features.md) | **Hubs***

## Hub Overview

- **Hub Type**: Isolated
- **Path**: [src/components/ui/Card.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/Card.jsx)
- **Used by Features**: 1
- **Total Dependency Paths**: 0
- **Packages Used**: @chakra-ui/react

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

    hub_Card["Card"]
    class hub_Card currentHub

    %% Features that use this hub (directly or indirectly)
    subgraph Features["Features"]
        feature_UserSummary["UserSummary"]
        class feature_UserSummary feature
    end

    feature_UserSummary --> hub_Card
    %% Components directly used by this hub
    subgraph pkg__chakra_ui_react["@chakra-ui/react"]
        comp__chakra_ui_react_Box["Box"]
        class comp__chakra_ui_react_Box component
        comp__chakra_ui_react_useColorModeValue["useColorModeValue"]
        class comp__chakra_ui_react_useColorModeValue component
    end
    hub_Card --> pkg__chakra_ui_react

    %% Direct hub-to-hub connections
```

## Features Using This Hub

| Feature | Path |
|---------|------|
| [UserSummary](../features/UserSummary.md) | [src/components/dashboard/UserSummary.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/UserSummary.jsx) |

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
| @chakra-ui/react | [Box](../components/@chakra-ui_react/Box.md), [useColorModeValue](../components/@chakra-ui_react/useColorModeValue.md) |


