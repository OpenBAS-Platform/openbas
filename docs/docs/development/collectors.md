# Collector development

This page explains how to build an OpenAEV Collector for a detection or prevention product, such as an **EDR (Endpoint Detection and Response)**, **XDR (Extended Detection and Response)**, **SIEM (Security Information and Event Management)** or **NDR (Network Detection and Response)**. The Collector fetches the product's security events and matches them against the expectations of the Injects that OpenAEV executed.

For a functional overview, see [Collectors](../integrations/collectors/collectors.md).

## Prerequisites

- Basic knowledge of Python and a working Python install.
- [PyOAEV](https://pypi.org/project/pyoaev/), the official Python client for the OpenAEV API.

!!! tip "Not just Python"

    A Collector talks to OpenAEV through the REST API, so you can write it in any language. This page uses PyOAEV.

## How a Collector works

![High level process overview](assets/high-level-collector-overview.png)

The pseudo-code below shows this loop with PyOAEV (some functions are omitted):

```python
from pyoaev.daemons import CollectorDaemon
from pyoaev.configuration import Configuration

# The whole Collector logic lives here.
def main_loop(collector: CollectorDaemon):
    # Get the expectations still waiting for a result
    expectations = collector.api.inject_expectation.expectations_models_for_source(collector.get_id())
    if any(expectations):
        # Fetch alerts from the security platform
        security_platform_alerts = security_platform_api.fetch_alerts()

        if any(security_platform_alerts):
            # Convert raw alerts to a format you can compare with the expectations
            processed_alerts = process_alerts(security_platform_alerts)
            for expectation in expectations:
                for processed_alert in processed_alerts:
                    if match(processed_alert, expectation):
                        # Update the object's data, then send it to the API
                        expectation.update(
                            success=processed_alert.get_outcome(),
                            sender_id=collector.get_id(),
                            metadata={}
                        )
                        collector.api.inject_expectation.update(
                            inject_expectation_id=expectation.inject_expectation_id,
                            inject_expectation=expectation
                        )

if __name__ == "__main__":
    # Where and how to read each configuration key
    config = Configuration(config_hints={
            # OpenAEV API
            "openaev_url": {"env": "OPENAEV_URL"},
            "openaev_token": {"env": "OPENAEV_TOKEN"},
            # Collector configuration
            "collector_id": {"env": "COLLECTOR_ID"},
            "collector_name": {"env": "COLLECTOR_NAME"},
            "collector_type": {
                "env": "COLLECTOR_TYPE",
                # A unique string, like a secondary ID
                "default": "my_collector_type",
            },
            "collector_platform": {
                "env": "COLLECTOR_PLATFORM",
                "default": "EDR"
            },
            # Security platform specific
            "platform_client_id": {"env": "PLATFORM_CLIENT_ID"},
            "platform_client_secret": {"env": "PLATFORM_CLIENT_SECRET"},
            "platform_api_base_url": {
                "env": "PLATFORM_API_BASE_URL",
                "default": "https://api.securityplatform.example",
            },
        },
    )

    # Long-running daemon
    collector = CollectorDaemon(configuration=config)
    # Method run at every period (default 60s)
    collector.set_callback(main_loop)
    collector.start()
```

## How to implement the matching logic

1. **Retrieve the expectations.** Fetch the expectations that your Collector has not answered yet. Answer them quickly to measure how fast your product responds. You do not need to fail late ones yourself: the expectation expiration job of OpenAEV marks unanswered expectations as expired after a timeout (see [Platform managers](../deployment/platform/managers.md#scheduled-jobs)).
2. **Retrieve the alerts.** Collect the alerts from your product and decide:
    - how to extract the data that matches the OpenAEV signatures;
    - whether the alert shows that the attack was prevented or detected.
3. **Match expectations and alerts.** Compare each expectation's signatures with the alert data, then update the expectation with the result.

A signature is a way to find an attack in an alert. The main ones are:

| Signature | Description |
|---|---|
| `parent_process_name` | Name of the parent process of the attack. For the OpenAEV implant, it is `oaev-implant-<inject_id>-agent-<agent_id>` (the file itself has `.exe` on Windows). |
| `source_ipv4_address`, `source_ipv6_address` | IP address of the Asset that ran the attack. |
| `target_ipv4_address`, `target_ipv6_address`, `target_hostname_address` | IP address or hostname targeted by the attack. |

![Collector diagram](assets/collector-diagram.png)

## Run the Collector

Start your Collector. It registers with OpenAEV through `POST /api/collectors` and appears under **Integrations > Deployed**.

![Collectors view in OpenAEV](assets/collectors-view.png)

## Examples

Use these reference implementations from the OpenAEV Collectors repository as a starting point for your own matching logic:

- [CrowdStrike Falcon EDR](https://github.com/OpenAEV-Platform/collectors/tree/main/crowdstrike)
- [Microsoft Defender](https://github.com/OpenAEV-Platform/collectors/tree/main/microsoft-defender)
- [Microsoft Sentinel](https://github.com/OpenAEV-Platform/collectors/tree/main/microsoft-sentinel)

## What's next?

- [Deploy Collectors](../integrations/collectors/deploy-collectors.md) -- Deploy and configure a Collector
- [Expectations](../usage/run-and-evaluate/expectations/expectations.md) -- Understand the expectations a Collector answers
- [Injector development](injectors.md) -- Build a custom Injector
- [API usage](api-usage.md) -- Call the OpenAEV REST API
