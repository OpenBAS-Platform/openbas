# OpenBAS Mastodon Injector

The OpenBAS Mastodon injector is a built-in injector, meaning it is natively included in the platform and can be enabled using configuration variables. It allows you to create Mastodon messages and statuses directly in your OpenBAS scenarios and simulations.

## Summary

- [Requirements](#requirements)
- [Configuration variables](#configuration-variables)
- [Behavior](#behavior)
    - [Mapping](#mapping)
- [Sources](#sources)

---

## Requirements

- OpenBAS Platform version 1.0.1 or higher
- A Mastodon instance

## Configuration variables

Below are the properties you'll need to set for OpenBAS:

| Property                 | application.properties | Docker environment variable | Mandatory | Description                     |
|--------------------------|------------------------|-----------------------------|-----------|---------------------------------|
| Enable Mastodon injector | mastodon.enable        | `MASTODON_ENABLE`           | Yes       | Enable the Mastodon injector.   |
| Mastodon URL             | mastodon.url           | `MASTODON_URL`              | Yes       | The URL of the Mastodon tenant. |