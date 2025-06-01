
*Navigation: [Home](index.md) | [Components](components.md) | [Files](files.md) | [Features](features.md) | **Hubs***



# Hubs Overview

**Total Hubs Found: 12**

## Hubs

Hubs are intersection points of components that are used by other hubs or features.
In other words, they are the building blocks based on the components of tracked packages.

### Hub Types and Relationships

```mermaid
flowchart LR
    classDef main stroke:#d04a02,stroke-width:2px;
    classDef intermediate stroke:#7e6000,stroke-width:2px;
    classDef base stroke:#006400,stroke-width:2px;
    subgraph MainHubs["Main Hubs"]
        MainHub1["Main Hub"]
    end

    subgraph IntermediateHubs["Intermediate Hubs"]
        IntHub1["Intermediate Hub 1"]
        IntHub2["Intermediate Hub 2"]
    end

    subgraph BaseHubs["Base Hubs"]
        BaseHub1["Base Hub 1"]
        BaseHub2["Base Hub 2"]
        BaseHub3["Base Hub 3"]
    end

    %% Main hub to first intermediate hub
    MainHub1 --> IntHub1
    %% First intermediate hub to second intermediate hub (recursive chain)
    IntHub1 --> IntHub2
    %% First intermediate hub to first base hub
    IntHub1 --> BaseHub1
    %% Second intermediate hub to second base hub
    IntHub2 --> BaseHub2
    %% Main hub directly to third base hub (bypassing intermediate hubs)
    MainHub1 --> BaseHub3
    class MainHub1 main
    class IntHub1,IntHub2 intermediate
    class BaseHub1,BaseHub2,BaseHub3 base
    class MainHubs main
    class IntermediateHubs intermediate
    class BaseHubs base

```

- **Main Hubs** (1): *Rely on Intermediate and Base hubs but are not utilized by other hubs.*
- **Intermediate Hubs** (1): *Both rely on other hubs and are used by other hubs.*
- **Base Hubs** (3): *Used by other hubs but don't rely on other hubs themselves.*
- **Isolated Hubs** (7): *Used only within their features and don't interact with other hubs.*

Hub dependencies can be:
- **Direct**: The hub directly imports and uses another hub
- **Indirect**: The hub uses another hub through an intermediate hub
- **Both**: The hub both directly and indirectly uses another hub

## Main Hubs

These components only depend on other hubs:

| Hub |
|-----|
| [ManagementHub](./hubs/ManagementHub.md) |


<a id="intermediate-hubs"></a>

## Intermediate Hubs*

These components both use and are used by other hubs:

| Hub | Used By Hubs |
|-----|-------------|
| [IntermediateForm](./hubs/IntermediateForm.md) [*](#intermediate-hubs) | [ManagementHub](../hubs/ManagementHub.md) |


## Base Hubs

These components are only used by other hubs:

| Hub | Used By Hubs |
|-----|-------------|
| [BaseCard](./hubs/BaseCard.md) | [ManagementHub](../hubs/ManagementHub.md), [IntermediateForm](../hubs/IntermediateForm.md) [*](#intermediate-hubs) |
| [BaseButton](./hubs/BaseButton.md) | [ManagementHub](../hubs/ManagementHub.md), [IntermediateForm](../hubs/IntermediateForm.md) [*](#intermediate-hubs) |
| [IntermediatePanel](./hubs/IntermediatePanel.md) | [ManagementHub](../hubs/ManagementHub.md) |


## Isolated Hubs

These components are used only within their features and don't interact with other hubs:

| Hub | Packages | Feature |
|-----|----------|---------|
| [ActionCard](./hubs/ActionCard.md) | @mui/material, @chakra-ui/react | [UserSummary](./features/UserSummary.md) |
| [Button](./hubs/Button.md) | @mui/material | [UserSummary](./features/UserSummary.md) |
| [Card](./hubs/Card.md) | @chakra-ui/react | [UserSummary](./features/UserSummary.md) |
| [ChakraButton](./hubs/ChakraButton.md) | @chakra-ui/react | [UserSummary](./features/UserSummary.md) |
| [ChakraCard](./hubs/ChakraCard.md) | @chakra-ui/react | [UserSummary](./features/UserSummary.md) |
| [DataDisplay](./hubs/DataDisplay.md) | @mui/material, @chakra-ui/react | [AdvancedPanel](./features/AdvancedPanel.md) |
| [InfoPanel](./hubs/InfoPanel.md) | @chakra-ui/react | [UserSummary](./features/UserSummary.md) |

