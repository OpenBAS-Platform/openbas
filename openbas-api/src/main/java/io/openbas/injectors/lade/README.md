# OpenBAS Airbus LADE Injector

The Airbus LADE injector is a built-in injector, meaning it is natively included in the platform and can be enabled using configuration variables. It allows you to use the various capabilities from the Airbus LADE directly in your OpenBAS scenarios and simulations.

## Summary

- [Requirements](#requirements)
- [Configuration variables](#configuration-variables)
- [Behavior](#behavior)
    - [Mapping](#mapping)
- [Sources](#sources)

---

## Requirements

- OpenBAS Platform version 1.0.3 or higher
- An Airbus LADE cyber range tenant

## Configuration variables

Below are the properties you'll need to set for OpenBAS:

| Property                    | application.properties                               | Docker environment variable | Mandatory | Description                              |
|-----------------------------|------------------------------------------------------|-----------------------------|-----------|------------------------------------------|
| Enable Airbus LADE injector | lade.enable                                          | `LADE_ENABLE`               | Yes       | Enable the Airbus LADE injector.         |
| Airbus LADE URL             | lade.url                                             | `LADE_URL`                  | Yes       | The URL of the Airbus LADE tenant.       |
| Session duration            | lade.session                                         | `LADE_SESSION`              | No        | The duration of the session (technical). |
| Airbus LADE username        | lade.username                                        | `LADE_USERNAME`             | Yes       | The Airbus LADE tenant username.         |
| Airbus LADE password        | lade.password                                        | `LADE_PASSWORD`             | Yes       | The Airbus LADE tenant password.         |