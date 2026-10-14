# Usage telemetry

OpenAEV sends usage statistics to Filigran. This page lists what is sent, where and how often, and
how to stop it.

!!! note "What telemetry contains"

    Telemetry sends counts, configuration flags and a few labels. The labels are:

    - the IP address of the server running the platform;
    - the platform unique identifier;
    - Security Platform names, as entered by users;
    - AI agent identifiers (lowercased, at most 64 characters);
    - the deployment tags;
    - the workflow safety policy values.

    No end-user or client IP address is sent, and no content of your Scenarios, Findings,
    vulnerabilities or Payloads.

## Purpose of the telemetry

Filigran uses the data to:

- improve the features and performance of the platform;
- understand how the platform is used, to improve the user experience;
- produce aggregated statistics for internal and external reporting.

## How data is sent

- **Destination**: `https://telemetry.oaev.filigran.io/v1/metrics`, using OTLP (OpenTelemetry
  Protocol) over HTTPS, encoded as protobuf.
- **Frequency**: metrics are collected every 60 minutes. The first export happens about 5 hours
  after the platform starts, then every 6 hours.
- **Startup check**: when the platform starts, it tests the connection to the destination. If the
  destination cannot be reached, telemetry stays off until the next restart.

## How to disable telemetry

There is no setting to turn telemetry off. To stop it, block outbound access or DNS resolution to
`telemetry.oaev.filigran.io` from the platform, then restart the platform. Blocking without a
restart only makes the exports fail. Air-gapped platforms never send telemetry.

## Telemetry metrics

Here are the main metrics sent.

### Platform identity

- The platform version
- The platform unique identifier and creation date
- The IP address of the server running the platform
- The deployment tags, when configured (`telemetry.tags` / `TELEMETRY_TAGS`): comma-separated free
  tags such as `saas,eu-west`, normalized to lowercase and sorted before export

### Usage

- Enterprise Edition status (activated or not)
- The number of users, the number of successful logins over the last 24 hours, and the number of
  active Tenants
- The number of credentials
- The number of Assets, by Asset category (host, cloud resource, web application...) and by agent
  coverage (agent based when at least one agent is installed on the Asset, agentless otherwise)
- The deployed Injectors, Collectors and Executors, by catalog identity (the catalog connector slug,
  or the component type when not deployed from the catalog, with a managed/manual flag)
- The number of Simulations, Scenarios and Atomic Tests created
- The number of Simulations played, and of Injects played by Injector type, with and without agents
- The number of times each Executor type is used
- The number of "Average" Dashboard widgets created
- The number of marking definitions created and updated, and the number of marking definitions per
  Tenant (the Tenant is identified by a SHA-256 hash of its id)
- Scope rule usage: entries created by mode, entries added by type and source, and the number of
  workflows using each source
- Workflow safety policy changes: timeout and rate-limit values, and whether they are the default

### AI and ecosystem

- AI usage counters, without any content: AI feature calls by feature (fix spelling, summarize,
  generate message...), chatbot messages, AI agent calls by agent identifier, TTP extractions, AI
  detection and remediation rule generations by Security Platform name, and inject assistant runs
- Whether the built-in LLM is enabled (with the provider type), whether XTM One is configured,
  whether the chatbot AI terms of use are accepted, and whether the platform is registered on XTM Hub
- The enabled authentication strategies (local, OIDC, SAML2, Kerberos)

### Content inventory

- Counts, without any content: Payloads (by type, source and status), Teams, endpoints (by
  platform), Asset groups, security platforms (by type), organizations, Injects, challenges,
  documents, channels, articles, custom Dashboards, import mappers, notification rules, workflows,
  Findings, vulnerabilities, vulnerable endpoints, attack patterns, reports, and recurring Scenarios

### Results and automation

- Expectation validation traces by Collector type
- Security coverage bundles processed, Scenarios generated from them, and results sent back
- Workflow runs, and runs force-completed by the timeout safety policy
- Payloads created per Payload type, Payloads duplicated, and Payloads upserted by Collectors
- Emails sent

## What's next?

- [Platform managers](../../deployment/platform/managers.md) -- How the telemetry manager runs
- [Configuration](configuration.md) -- All platform configuration parameters
