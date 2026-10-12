# Security Coverage enrichment (XTM Suite)

This page explains how to connect OpenAEV to OpenCTI, so that OpenCTI can trigger Scenarios in OpenAEV and receive their results, such as detection and prevention rates.

## What is this?

The XTM Suite connector lets OpenAEV exchange data with other Filigran products. OpenAEV sends its validation results (detection rate, prevention rate) back to the connected product. Today, this works with OpenCTI.

## Why use it?

- **Automated feedback loop**: Security Coverage results from OpenAEV simulations are automatically pushed back to OpenCTI, enriching threat intelligence with real validation data.
- **Continuous posture assessment**: Trigger scenario executions directly from OpenCTI to validate your defenses against specific threats.
- **Unified visibility**: View detection and prevention rates alongside threat intelligence in a single platform.

## Automated enrichment for OpenCTI

### Prerequisites

This feature requires:

1. An active **OpenCTI instance** (v6.x or later recommended). Refer to the [OpenCTI documentation](https://docs.opencti.io/latest/) for deployment instructions.
2. The **OpenAEV platform** configured and running with at least one scenario ready to execute.

Once the OpenCTI instance is up and running, gather the following information:

| Item | Description |
|:-----|:------------|
| OpenCTI URL | The instance's full domain name (e.g., `https://opencti.domain.example`) |
| API Token | A valid API token with sufficient privileges (see [Configuring the Connector API token](https://docs.opencti.io/latest/deployment/connectors/#connector-token)) |

### How to enable the connector

#### Step 1: configure OpenAEV to connect to OpenCTI

Each OpenCTI connection belongs to an OpenAEV Tenant, identified by its UUID (`{id}`). Each Tenant in a [multi-tenant deployment](../../administration/multi-tenancy.md) can have its own OpenCTI connection.

Set the following parameters in your OpenAEV deployment:

```properties
openaev.xtm.opencti.{id}.enable=true
openaev.xtm.opencti.{id}.url=https://opencti.domain.example
openaev.xtm.opencti.{id}.token=<your-opencti-api-token>
```

Or as environment variables:

```properties
OPENAEV_XTM_OPENCTI_{id}_ENABLE=true
OPENAEV_XTM_OPENCTI_{id}_URL=https://opencti.domain.example
OPENAEV_XTM_OPENCTI_{id}_TOKEN=<your-opencti-api-token>
```

!!! tip "What is `{id}`?"

    The `{id}` is the Tenant UUID (for example `2cffad3a-0001-4078-b0e2-ef74274022c3`), shown as **Tenant identifier** in **Settings > Parameters**.

!!! tip "API URL override"

    Set `openaev.xtm.opencti.{id}.api-url` only if your GraphQL endpoint is not `<url>/graphql`, for example behind a reverse proxy with a custom path.

#### Step 2: restart OpenAEV

After updating the configuration, restart the OpenAEV platform for the changes to take effect.

#### Step 3: check the connection

In OpenCTI, open **Data > Ingestion > Monitoring**: the **OpenAEV Coverage** connector is listed.

![Active OpenAEV Coverage connector in OpenCTI](assets/active_openaev_connector_in_opencti.png)

### Trigger enrichments from OpenCTI

Once the connector appears in OpenCTI, you can trigger it to run security coverage enrichments. Refer to the [OpenCTI Security Coverage documentation](https://docs.opencti.io/latest/usage/security-coverage/) for how to trigger the enabled connector to get automated enriched security posture assessments with OpenAEV.

## Hunt validation from emulation results

OpenCTI hunts search your SIEM, EDR or data lake for the techniques of a threat. OpenAEV can prove whether those hunts actually catch a technique: every emulation of the technique by a simulation is a known-true event, so OpenAEV asks OpenCTI to run its hunts over the time the emulation ran, on the security platform that watched it. OpenCTI then records whether the hunts found it as a `hunt_detected` coverage result on the Security Coverage, next to the detection and prevention rates.

This feature requires OpenCTI **Enterprise Edition** with hunts and a hunt connector bound to the security platform. It is **disabled by default**.

OpenCTI matches the security platform by the STIX ID the simulation results gave it, then by its exact name: give the hunt connector the same security platform name as the security platform in OpenAEV, so both designate the same OpenCTI Security Platform.

### How it works

1. A simulation generated from an OpenCTI Security Coverage runs. Its injects emulate ATT&CK techniques (the Attack Patterns of their Threat Arsenal action) on your assets.
2. The security platforms connected through collectors (EDR, XDR, SIEM, SOAR, NDR, ISPM) give their verdict on the detection and prevention expectations of each inject, or the expectations expire.
3. Once the simulation results are pushed back to OpenCTI, OpenAEV plans one hunt validation per **inject, technique and security platform** whose verdict is computed. A triple is planned once only, however many times the results are pushed again.
4. A background job sends each validation to OpenCTI (`huntValidateFromEmulation`) with:
    - the technique ATT&CK ID (for example `T1059.001`),
    - the security platform, by the STIX ID of its identity in the Security Coverage bundle the simulation results were pushed in (the same ID, so OpenCTI finds the platform those results created) and by its name, which OpenCTI falls back to,
    - the inject ID,
    - the inject execution window, from the time the inject was sent to the time it completed, widened by a padding (5 minutes by default) on both sides, and never shorter than one minute,
    - the OpenCTI Security Coverage ID of the simulation.
5. OpenCTI runs its active hunts covering the technique on the hunt connector of that security platform, over that window, and writes the outcome on the coverage.

Only injects that ran (status `Executed` or `Partial`) are validated. Platform types OpenCTI hunts cannot run on (email security, AI defense, vulnerability scanners) are skipped. A validation OpenCTI accepted is never sent again, even when no active hunt covered the technique at that time: OpenCTI is idempotent per inject, hunt and security platform.

### Enable it

The validation uses the OpenCTI connection of each tenant configured in [Step 1](#step-1-configure-openaev-to-connect-to-opencti), and is enabled for the whole platform:

```properties
openaev.security-coverage.hunt-validation.enabled=true
```

Or as an environment variable:

```properties
OPENAEV_SECURITY-COVERAGE_HUNT-VALIDATION_ENABLED=true
```

!!! note

    Docker Compose and Kubernetes accept this hyphenated name, but a POSIX shell does not. From a shell, use the equivalent form without hyphens, which OpenAEV reads the same way: `OPENAEV_SECURITYCOVERAGE_HUNTVALIDATION_ENABLED=true`. The other settings follow the same rule.

See the [configuration reference](../../reference/deployment/configuration.md#xtm-suite-opencti-hunt-validation) for the window padding, the request timeout, the batch size, the number of attempts and the maximum age.

### Failures

A hunt validation never blocks the simulation results: they are pushed to OpenCTI first, and the validations are sent by a separate job, at most 50 per tenant and per run by default. Tenants are visited in a random order and a tenant stops starting new calls after one minute per run, so a slow OpenCTI never holds the validations of the other tenants; the validations left are sent by the next run.

- When OpenCTI refuses a validation (Enterprise Edition not enabled, unknown technique or security platform, OpenCTI version without hunts), OpenAEV logs one warning per tenant and per run, and retries after 5, 10, 20 and 40 minutes before giving the validation up (5 attempts by default).
- When OpenCTI cannot be reached, answers a server error, rate limits the call, or the tenant's OpenCTI connector is not registered, the job stops sending for that tenant and postpones the validations of the run by 5 minutes without counting an attempt: an outage does not use up the attempts.
- A validation still not delivered 7 days after it was planned (the maximum age) is given up before it is sent, whatever the reason, so no outage keeps it retried forever and OpenCTI never receives a stale validation.

## Example workflow

1. A threat analyst identifies a new intrusion set in **OpenCTI**.
2. The analyst triggers the **OpenAEV Coverage** connector on the associated Security Coverage object.
3. OpenAEV receives the request, maps it to an existing scenario, and executes the simulation.
4. Results (detection rate, prevention rate, findings) are pushed back to OpenCTI as enrichment data.
5. When hunt validation is enabled, OpenAEV asks OpenCTI to run its hunts over each emulated technique, and OpenCTI adds whether the hunts caught it to the coverage.
6. The analyst sees the updated security posture directly in the OpenCTI interface.

## What's next?

- [XTM One](xtm-one.md) -- Connect OpenAEV to XTM One for its AI features
- [Scenario generation from OpenCTI security coverage](../../usage/build/scenario/security-coverage.md) -- Create Scenarios from OpenCTI Security Coverage objects
- [Configuration reference](../../reference/deployment/configuration.md#xtm-suite-opencti) -- All configuration parameters
- [Scenarios and Simulations](../../usage/get-started/foundations/scenarios-and-simulations.md) -- How Scenarios and Simulations work
