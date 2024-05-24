# OpenBAS Microsoft Sentinel Collector

The Microsoft Sentinel collector is a built-in collector, meaning it is natively included in the platform and can be enabled using configuration variables. It collect incidents from a Microsoft Sentinel tenant to validate detection expectations in OpenBAS.

## Summary

- [Requirements](#requirements)
- [Configuration variables](#configuration-variables)
- [Behavior](#behavior)
    - [Mapping](#mapping)
- [Sources](#sources)

---

## Requirements

- OpenBAS Platform version 1.0.3 or higher
- A deployed Microsoft Sentinel instance

## Configuration variables

Below are the properties you'll need to set for OpenBAS:

| Property                  | application.properties                               | Docker environment variable                          | Mandatory | Description                                                                         |
|---------------------------|------------------------------------------------------|------------------------------------------------------|-----------|-------------------------------------------------------------------------------------|
| Enable Sentinel collector | collector.sentinel.enable                            | `COLLECTOR_SENTINEL_ENABLE`                          | Yes       | Enable the Sentinel collector.                                                      |
| Collector ID              | collector.sentinel.id                                | `COLLECTOR_SENTINEL_ID`                              | Yes       | The ID of the collector.                                                            |
| Sentinel polling interval | collector.sentinel.interval                          | `COLLECTOR_SENTINEL_INTERVAL`                        | No        | The time interval in seconds where the collect is triggered. Default is 60 seconds. |
| Microsoft URL             | collector.sentinel.authority.base-url                | `COLLECTOR_SENTINEL_AUTHORITY_BASE-URL`              | Yes       | The Base URL of Microsoft.                                                          |
| Microsoft Tenant ID       | collector.sentinel.authority.tenant-key              | `COLLECTOR_SENTINEL_AUTHORITY_TENANT-ID`             | Yes       | Your Tenant ID in Microsoft.                                                        |
| Sentinel Client ID        | collector.sentinel.client-id                         | `COLLECTOR_SENTINEL_CLIENT-ID`                       | Yes       | Microsoft Sentinel Client ID.                                                       |
| Sentinel Client Secret    | collector.sentinel.client-secret                     | `COLLECTOR_SENTINEL_CLIENT-SECRET`                   | Yes       | Microsoft Sentinel Client Secret.                                                   |
| Subscription ID           | collector.sentinel.subscription.id                   | `COLLECTOR_SENTINEL_SUBSCRIPTION_ID`                 | Yes       | Subscription ID.                                                                    |
| Resource Groups Name      | collector.sentinel.subscription.resource-groups.name | `COLLECTOR_SENTINEL_SUBSCRIPTION_RESOURCE-GROUPS_ID` | Yes       | Resource Groups Name.                                                               |
| Workspace Name            | collector.sentinel.subscription.workspace.name       | `COLLECTOR_SENTINEL_SUBSCRIPTION_WORKSPACE_NAME`     | Yes       | Workspace Name.                                                                     |

## Behavior

Each interval :

- a job retrieves the latest incidents updated over the past 15 minutes on Microsoft Sentinel and performs an asset-based reconciliation between pending detection expectations and detected incidents.
- another job retrieves the latest alerts updated over the past 15 minutes on Microsoft Sentinel and performs an asset-based reconciliation between pending prevention expectations and alerts.

## Sources

- [Micosoft Sentinel API](https://learn.microsoft.com/fr-fr/rest/api/securityinsights/)
