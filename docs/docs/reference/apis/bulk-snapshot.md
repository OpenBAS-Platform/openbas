# Bulk snapshot export

The bulk snapshot export is a pair of REST API endpoints that return the current, verified state of
every Asset in a Tenant, one page at a time. It is built for the OpenGRC connector and other GRC
(Governance, Risk and Compliance) integrations: instead of replaying every Simulation, a consumer
polls these endpoints and syncs only what changed.

!!! note "Preview feature"

    The bulk snapshot export is a preview feature, off by default. See
    [Enabling the feature](#enabling-the-feature).

## Before you start

- **Enable the `BULK_SNAPSHOT_EXPORT` preview feature.** See
  [Enabling the feature](#enabling-the-feature).
- **Create a dedicated, non-administrator user** for the connector and grant it the
  `Access observation snapshots` capability. See
  [Users and RBAC](../../administration/users-and-rbac.md). The connector authenticates with that
  user's API token.

!!! warning "Decide what the account sees"

    Observations follow the same access rules as their Scenario and Simulation:

    - an administrator, or an account with `Bypass` or `Access assessment`, sees the observations
      of **every** Scenario and Simulation of the Tenant;
    - any other account only sees the observations of the Scenarios and Simulations it has a grant
      on. Without any grant, the attack stream is **empty**, with no error.

    For a full inventory, give the account `Access assessment`. The documents of a newly granted
    Scenario that the connector's cursor has already passed only come back with the next full
    reconciliation.

!!! note "Unrestricted documents are visible Tenant-wide"

    A document that belongs to no Scenario or Simulation, such as a Finding produced outside any
    Scenario, is returned to every holder of `Access observation snapshots` in the Tenant, whatever
    their grants. Grant this capability only to accounts meant to see the whole Tenant inventory.

### Enabling the feature

Add `BULK_SNAPSHOT_EXPORT` to the `openaev.enabled-dev-features` property (empty by default), then
restart the platform:

```properties
openaev.enabled-dev-features=BULK_SNAPSHOT_EXPORT
```

The value is a comma-separated list of preview feature names, and `*` enables all of them. If the
property already has a value, extend it, for example
`openaev.enabled-dev-features=SOME_OTHER_FEATURE,BULK_SNAPSHOT_EXPORT`.

The `Access observation snapshots` capability only appears in roles once the feature is enabled.

!!! note "Legacy property name"

    The legacy `openbas.enabled-dev-features` key is still read and takes precedence over
    `openaev.enabled-dev-features` when set.

## Endpoints

Both endpoints are `POST` requests scoped to a Tenant. They take the same request body and return
the same response envelope:

```http
POST /api/tenants/{tenantId}/snapshot/attack-observations/search
POST /api/tenants/{tenantId}/snapshot/vulnerability-observations/search
```

### Request body

All fields are optional.

| JSON field | Type | Default | Description |
|---|---|---|---|
| `cursor` | string | `null` | Opaque resume token from a previous page. Cannot be sent with `since`. |
| `since` | ISO-8601 instant | `null` | Only return documents updated at or after this instant. Cannot be sent with `cursor`. |
| `page_size` | integer | `500` | Clamped to `[1, 1000]`. |
| `safety_lag_seconds` | integer | `120` | Clamped to `[max(60, grace), 3600]`, where `grace` is the `engine.indexing-grace-window-seconds` [configuration parameter](../deployment/configuration.md#engine). |

Out-of-range values are corrected, not rejected: `page_size: 5000` returns up to 1000 items.

### Response envelope

| JSON field | Meaning |
|---|---|
| `observations` | The page, at most `page_size` items. |
| `next_cursor` | Opaque resume token for the next page. An empty page echoes back the `cursor` it was given, so this is safe to store unconditionally. `null` only when the walk has no cursor yet (a `since` walk that matched nothing). |
| `has_more` | `true` when the page came back exactly full, meaning another page is expected to follow. |
| `snapshot_window_end` | Inclusive upper bound of the window this page covers: `min(now - safety_lag, indexed_through)`, rounded down to the last millisecond indexing has entirely passed (observation timestamps have millisecond resolution). |
| `indexed_through` | Approximate indexing horizon of this stream. A readiness signal, not the exact indexing cursor — see [Consistency and the safety lag](#consistency-and-the-safety-lag). |
| `server_time` | The single instant the whole response was computed from. |
| `consistency_mode` | Always `"eventual"`. |
| `snapshot_ready` | `true` when `indexed_through` is current with `now - safety_lag`, i.e. the window is not lagging beyond its own safety margin. |

## Attack observations

One document per Tenant, Asset, attack pattern, expectation type and Scenario: the latest verified
state of one technique on one Asset in one Scenario.

| JSON field | Meaning |
|---|---|
| `id` | Observation id. |
| `updated_at` | Last update timestamp. |
| `asset_id` | Asset id. |
| `scenario_id` | Scenario id. |
| `last_simulation_id` | Id of the last Simulation that produced this observation. |
| `last_simulation_start_date` | Start date of that Simulation. |
| `last_simulation_status` | Status of that Simulation: `SCHEDULED`, `RUNNING`, `PAUSED`, `FINISHED` or `CANCELED`. |
| `last_inject_id` | Id of the Inject of the latest verified attempt, the one behind `last_verified_at`. |
| `platforms_reporting` | Ids of the Security Platforms that reported on this technique. |
| `platform_types_reporting` | Types of the Security Platforms that reported on this technique (`EDR`, `SIEM`...). |
| `asset_name` | Asset name. |
| `endpoint_hostname` | Endpoint hostname, `null` for an Asset that is not an Endpoint. |
| `endpoint_platform` | Endpoint platform, `null` for an Asset that is not an Endpoint. |
| `tenant_name` | Tenant name. |
| `attack_pattern_external_id` | Attack pattern external id. |
| `attack_pattern_name` | Attack pattern name. |
| `scenario_name` | Scenario name. |
| `last_simulation_name` | Name of the last Simulation that produced this observation. |
| `expectation_type` | Either `PREVENTION` or `DETECTION`. |
| `expectation_status` | `SUCCESS` when `attempts_success` equals `attempts_total`, `FAILED` when `attempts_success` is `0`, `PARTIAL` otherwise. Never `PENDING` nor `UNKNOWN`. |
| `attempts_total` | Number of attempts carrying a verdict. Attempts still awaiting one are not counted, so a partially executed replay does not deflate `coverage_ratio`. |
| `attempts_success` | Number of those attempts that met the expected score. |
| `coverage_ratio` | `attempts_success` divided by `attempts_total`, between `0` and `1`. |
| `platforms_succeeded` | Ids of the Security Platforms that succeeded. |
| `platform_types_succeeded` | Types of the Security Platforms that succeeded. |
| `last_verified_at` | Last verification timestamp. |

Platforms in `platforms_reporting` but not in `platforms_succeeded` are the ones the interface shows
as "Missed by security platform". The `platform_types_*` fields carry the same two sets as types.
An observation can span several Injects of the Simulation: `last_inject_id` is one of them.

## Vulnerability observations

One document per Tenant, Asset and vulnerability: the latest known state of one vulnerability on one
Asset.

| JSON field | Meaning |
|---|---|
| `id` | Observation id. |
| `updated_at` | Last update timestamp. |
| `asset_id` | Asset id. |
| `last_finding_id` | Id of the Finding that defines the current state of this grain. |
| `last_scenario_id` | Id of the last Scenario that produced this observation, or `null` when the Finding was produced outside any Scenario. |
| `last_simulation_id` | Id of the last Simulation that produced this observation. |
| `finding_type` | Type of the Finding. Currently always `CVE` (Common Vulnerabilities and Exposures). |
| `finding_value` | Finding value. |
| `asset_name` | Asset name. |
| `endpoint_hostname` | Endpoint hostname, `null` for an Asset that is not an Endpoint. |
| `endpoint_platform` | Endpoint platform, `null` for an Asset that is not an Endpoint. |
| `tenant_name` | Tenant name. |
| `vulnerability_external_id` | Vulnerability external id. |
| `last_scenario_name` | Name of the last Scenario that produced this observation, or `null` when the Finding was produced outside any Scenario. |
| `last_simulation_name` | Name of the last Simulation that produced this observation. |
| `last_verified_at` | Last verification timestamp. |

`last_finding_id` is the one Finding that defines the observation's state.

Only `CVE` Findings are exported. A CVE named in a `Vulnerability` Finding is not, because the value
of such a Finding holds the name and status together (`name [status]`).

## Cursor semantics

- **No `cursor` and no `since`**: full reconciliation, a walk of the entire current state.
- **`since`**: a walk of the current state, limited to documents updated at or after that instant.
- **`cursor`**: resume a walk from the `next_cursor` of a previous page.

The cursor is opaque and bound to the Tenant and the stream it was issued for. Do not parse it or
reuse it across Tenants or streams.

!!! example "Full reconciliation, then resume by cursor"

    First request, with no `cursor` and no `since`:

    ```http
    POST /api/tenants/2cffad3a-0001-4078-b0e2-ef74274022c3/snapshot/attack-observations/search
    ```

    ```json
    {
      "page_size": 500
    }
    ```

    ```json
    {
      "observations": [ /* ... up to 500 items ... */ ],
      "next_cursor": "eyJ2IjoxLCJ0ZW5hbnQiOiIyY2ZmYWQzYS0wMDAxLTQwNzgtYjBlMi1lZjc0Mjc0MDIyYzMiLCJ0cyI6IjIwMjYtMDgtMjRUMDc6NTg6MDBaIiwiaWQiOiI3ZjNiMWM2Mi05ZDRhLTRmMTgtOGIyMS01YzBlOWE3ZDRlMzMifQ",
      "has_more": true,
      "snapshot_window_end": "2026-08-24T07:58:00Z",
      "indexed_through": "2026-08-24T07:59:30Z",
      "server_time": "2026-08-24T08:00:00Z",
      "consistency_mode": "eventual",
      "snapshot_ready": true
    }
    ```

    `has_more` is `true`, so the client sends the returned `next_cursor`:

    ```json
    {
      "cursor": "eyJ2IjoxLCJ0ZW5hbnQiOiIyY2ZmYWQzYS0wMDAxLTQwNzgtYjBlMi1lZjc0Mjc0MDIyYzMiLCJ0cyI6IjIwMjYtMDgtMjRUMDc6NTg6MDBaIiwiaWQiOiI3ZjNiMWM2Mi05ZDRhLTRmMTgtOGIyMS01YzBlOWE3ZDRlMzMifQ"
    }
    ```

    An empty page with `has_more: false` means the client has caught up. The cursor comes back
    unchanged, so the client stores `next_cursor` and polls again later.

## Consistency and the safety lag

The served window always stays behind the platform's own indexing:
`snapshot_window_end = min(now - safety_lag, indexed_through)`. The safety lag makes sure rows
committed by long write transactions are not missed.

`indexed_through` is approximate. Once indexing has passed `now - safety_lag`, the platform reports
`now - grace` instead of measuring the exact progress. This never changes what is served, which
stays capped at `now - safety_lag`: treat `indexed_through` as a readiness signal only.

The check for pending rows is per Tenant, but indexing runs for all Tenants together. On a busy
shared platform, another Tenant's write volume can delay `indexed_through` and `snapshot_ready`.

## Client obligations

A client must honor the following:

1. **Delivery is at-least-once.** Process documents idempotently on `id` and `updated_at`: the same
   document can come twice.
2. **While `snapshot_ready` is `false`, the inventory is incomplete.** Do not read a missing document
   as a verdict.
3. **Do not wait for `snapshot_ready` before polling.** It tells you how to read the data, not when to
   poll. A client that sleeps until it becomes `true` can wait forever on a busy platform.
4. **Run a full reconciliation at least weekly.** Differential sync carries no deletions; only a full
   reconciliation reveals observations removed from the export, such as those of a deleted Asset or
   Scenario. It does not fix superseded attack observations or deleted Findings (items 9 and 10).
5. **A missing document has several meanings.** It may be out of scope, never verified, or deleted;
   the export cannot tell them apart.
6. **The attack stream only covers Scenarios.** An Asset tested only outside a Scenario has no attack
   observation. Vulnerability observations are exported even without a Scenario, with
   `last_scenario_id` and `last_scenario_name` set to `null`.
7. **Names are as of the last update.** Asset, endpoint, Scenario, Simulation, attack pattern and
   Tenant names are copied when the observation is recomputed. A rename only shows up with the next
   verdict or Finding on that observation, even after a full reconciliation. Join on ids, never on
   names.
8. **Attack patterns are counted per Injector contract.** A contract with three techniques, detected
   once, produces three `SUCCESS` documents, one per technique.
9. **A later Simulation can supersede an attack observation.** When a later Simulation of a Scenario
   no longer plays a technique on an Asset, the observation keeps the earlier verdict, full
   reconciliation included. For the same Asset and Scenario, an observation whose
   `last_simulation_start_date` is older than that of another one with `last_simulation_status` `FINISHED` is superseded.
10. **Deleting a Finding does not update its vulnerability observation.** The observation keeps its
    last state, `last_finding_id` included, and stays in the export even when no matching Finding
    remains, full reconciliation included.

## Errors

| Status | Cause |
|---|---|
| **400** | `since` and `cursor` sent together, or a malformed, unsupported-version, foreign-Tenant or foreign-stream `cursor`. |
| **401** | No authentication. |
| **403** | Missing the `Access observation snapshots` capability, or not a member of the Tenant in the path. |
| **404** | The `BULK_SNAPSHOT_EXPORT` preview feature is off: the endpoints do not exist. |

## What's next?

- [Users and RBAC](../../administration/users-and-rbac.md) -- Create the connector's user and grant
  it the `Access observation snapshots` capability
- [Configuration](../deployment/configuration.md#engine) -- The `engine.indexing-grace-window-seconds`
  parameter that bounds `safety_lag_seconds`
- [REST API](rest-api.md) -- Authenticate and call the OpenAEV REST API
