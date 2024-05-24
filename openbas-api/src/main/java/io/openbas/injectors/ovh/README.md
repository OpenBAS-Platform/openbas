# OpenBAS OVHCloud SMS Platform Injector

The OVHCloud SMS Platform injector is a built-in injector, meaning it is natively included in the platform and can be enabled using configuration variables. It allows you to send SMS through the OVHCloud SMS services directly in your OpenBAS scenarios and simulations.

## Summary

- [Requirements](#requirements)
- [Configuration variables](#configuration-variables)
- [Behavior](#behavior)
    - [Mapping](#mapping)
- [Sources](#sources)

---

## Requirements

- OpenBAS Platform version 1.0.3 or higher
- A valid OVHCloud SMS subscription

## Configuration variables

Below are the properties you'll need to set for OpenBAS:

| Property                     | application.properties | Docker environment variable | Mandatory | Description                           |
|------------------------------|------------------------|-----------------------------|-----------|---------------------------------------|
| Enable OVHCloud SMS injector | ovh.sms.enable         | `OVH_SMS_ENABLE`            | Yes       | Enable the OVHCloud SMS injector.     |
| OVHCloud Access Key          | ovh.sms.ak             | `OVH_SMS_AK`                | Yes       | The OVHCloud API access key.          |
| OVHCloud Access Secret       | ovh.sms.as             | `OVH_SMS_AS`                | Yes       | The OVHCloud API secret key.          |
| OVHCloud CK                  | ovh.sms.ck             | `OVH_SMS_CK`                | Yes       | The OVHCloud API CK.                  |
| OVHCloud Service Identifier  | ovh.sms.service        | `OVH_SMS_SERVICE`           | Yes       | The OVHCloud SMS service identifier.  |