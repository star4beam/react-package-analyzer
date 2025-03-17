# Hub: InfoPanel

*Navigation: [Home](../index.md) | [Components](../components.md) | [Files](../files.md) | [Features](../features.md) | **Hubs***

## Hub Overview

- **Hub Type**: Isolated
- **Path**: [src/components/common/InfoPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/common/InfoPanel.jsx)
- **Used by Features**: 1
- **Total Dependency Paths**: 2
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

    hub_InfoPanel["InfoPanel"]
    class hub_InfoPanel currentHub

    %% Features that use this hub (directly or indirectly)
    subgraph Features["Features"]
        feature_UserSummary["UserSummary"]
        class feature_UserSummary feature
    end

    feature_UserSummary --> hub_InfoPanel
    %% Direct hub-to-hub connections
```

## Features Using This Hub

| Feature | Path |
|---------|------|
| [UserSummary](../features/UserSummary.md) | [src/components/dashboard/UserSummary.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/UserSummary.jsx) |

## Hubs This Hub Depends On

This hub does not depend on any other hubs.

## Components Used Indirectly

This section shows how components from packages are used by this hub through intermediate files.

| Target Components | Path |
| ---------------- | ---- |
| [Box](../components/@chakra-ui_react/Box.md), [Heading](../components/@chakra-ui_react/Heading.md), [Text](../components/@chakra-ui_react/Text.md) (@chakra-ui/react) | [src/components/ui/ChakraCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/ChakraCard.jsx) |
| [Button](../components/@chakra-ui_react/Button.md) (@chakra-ui/react) | [src/components/ui/ChakraButton.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/ChakraButton.jsx) |

## Components Used Directly

This section shows the components directly used by this hub from packages.

| Package | Components |
| ------- | ---------- |
| @chakra-ui/react | [Flex](../components/@chakra-ui_react/Flex.md), [Icon](../components/@chakra-ui_react/Icon.md), [Text](../components/@chakra-ui_react/Text.md) |


