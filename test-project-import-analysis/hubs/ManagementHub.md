# Hub: ManagementHub

*Navigation: [Home](../index.md) | [Components](../components.md) | [Files](../files.md) | [Features](../features.md) | **Hubs***

## Hub Overview

- **Hub Type**: Main
- **Path**: [src/components/composite/ManagementHub.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/composite/ManagementHub.jsx)
- **Used by Features**: 2
- **Total Dependency Paths**: 4
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

    hub_ManagementHub["ManagementHub"]
    class hub_ManagementHub currentHub

    %% Features that use this hub (directly or indirectly)
    subgraph Features["Features"]
        feature_MainDashboard["MainDashboard"]
        class feature_MainDashboard feature
        feature_SettingsPanel["SettingsPanel"]
        class feature_SettingsPanel feature
    end

    feature_MainDashboard --> hub_ManagementHub
    feature_SettingsPanel --> hub_ManagementHub
    %% Base Hubs
    subgraph BaseHubs["Base Hubs"]
        direction TB
        hub_IntermediatePanel["IntermediatePanel"]
        class hub_IntermediatePanel base
        hub_BaseCard["BaseCard"]
        class hub_BaseCard base
        hub_BaseButton["BaseButton"]
        class hub_BaseButton base
    end

    %% Intermediate Hubs
    subgraph IntermediateHubs["Intermediate Hubs"]
        direction TB
        hub_IntermediateForm["IntermediateForm"]
        class hub_IntermediateForm intermediate
    end

    %% Components directly used by this hub
    subgraph pkg__mui_material["@mui/material"]
        comp__mui_material_Paper["Paper"]
        class comp__mui_material_Paper component
        comp__mui_material_Typography["Typography"]
        class comp__mui_material_Typography component
    end
    hub_ManagementHub --> pkg__mui_material
    subgraph pkg__chakra_ui_react["@chakra-ui/react"]
        comp__chakra_ui_react_VStack["VStack"]
        class comp__chakra_ui_react_VStack component
        comp__chakra_ui_react_Heading["Heading"]
        class comp__chakra_ui_react_Heading component
    end
    hub_ManagementHub --> pkg__chakra_ui_react

    %% Direct hub-to-hub connections
    hub_ManagementHub --> hub_IntermediatePanel
    hub_ManagementHub --> hub_IntermediateForm
    hub_ManagementHub --> hub_BaseButton
    hub_IntermediateForm --> hub_BaseCard
    hub_IntermediateForm --> hub_BaseButton
```

## Features Using This Hub

| Feature | Path |
|---------|------|
| [MainDashboard](../features/MainDashboard.md) | [src/components/dashboard/MainDashboard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/dashboard/MainDashboard.jsx) |
| [SettingsPanel](../features/SettingsPanel.md) | [src/components/settings/SettingsPanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/settings/SettingsPanel.jsx) |

## Hubs Using This Hub

No other hubs use this hub.

## Hubs This Hub Depends On

| Hub | Path | Dependency Type |
|-----|------|----------------|
| [BaseButton](../hubs/BaseButton.md) | [src/components/ui/BaseButton.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/BaseButton.jsx) | both |
| [BaseCard](../hubs/BaseCard.md) | [src/components/ui/BaseCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/BaseCard.jsx) | indirect |
| [IntermediateForm](../hubs/IntermediateForm.md) | [src/components/ui/IntermediateForm.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/IntermediateForm.jsx) | direct |
| [IntermediatePanel](../hubs/IntermediatePanel.md) | [src/components/ui/IntermediatePanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/IntermediatePanel.jsx) | direct |

## Components Used Indirectly

This section shows components used by other hubs that this hub depends on.

| Hub | Components Used |
| --- | -------------- |
| [BaseButton](../hubs/BaseButton.md) ([src/components/ui/BaseButton.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/BaseButton.jsx)) | [Button](../components/@mui_material/Button.md) (@mui/material)<br>[Button](../components/@chakra-ui_react/Button.md) (@chakra-ui/react) |
| [BaseCard](../hubs/BaseCard.md) ([src/components/ui/BaseCard.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/BaseCard.jsx)) | [Box](../components/@mui_material/Box.md), [Paper](../components/@mui_material/Paper.md) (@mui/material)<br>[Card](../components/@chakra-ui_react/Card.md), [CardBody](../components/@chakra-ui_react/CardBody.md), [CardHeader](../components/@chakra-ui_react/CardHeader.md), [Heading](../components/@chakra-ui_react/Heading.md) (@chakra-ui/react) |
| [IntermediateForm](../hubs/IntermediateForm.md) ([src/components/ui/IntermediateForm.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/IntermediateForm.jsx)) | [TextField](../components/@mui_material/TextField.md) (@mui/material)<br>[FormControl](../components/@chakra-ui_react/FormControl.md), [FormLabel](../components/@chakra-ui_react/FormLabel.md), [VStack](../components/@chakra-ui_react/VStack.md) (@chakra-ui/react) |
| [IntermediatePanel](../hubs/IntermediatePanel.md) ([src/components/ui/IntermediatePanel.jsx](https://github.com/star4beam/react-import-analyzer/blob/main/test-project/src/components/ui/IntermediatePanel.jsx)) | [Divider](../components/@mui_material/Divider.md) (@mui/material)<br>[Box](../components/@chakra-ui_react/Box.md), [Stack](../components/@chakra-ui_react/Stack.md) (@chakra-ui/react) |

## Components Used Directly

This section shows the components directly used by this hub from packages.

| Package | Components |
| ------- | ---------- |
| @chakra-ui/react | [Heading](../components/@chakra-ui_react/Heading.md), [VStack](../components/@chakra-ui_react/VStack.md) |
| @mui/material | [Paper](../components/@mui_material/Paper.md), [Typography](../components/@mui_material/Typography.md) |


