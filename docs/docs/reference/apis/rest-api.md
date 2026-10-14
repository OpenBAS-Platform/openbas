# REST API

OpenAEV provides a REST API that lets you perform any platform action programmatically. Any action available in the graphical interface can also be run through the API.

## Why use the REST API?

The REST API is useful when you need to:

- **Automate repetitive tasks** such as creating Scenarios, launching Simulations, or importing Assets in bulk.
- **Integrate OpenAEV with external tools** like SIEMs (Security Information and Event Management systems), ticketing systems, or CI/CD (Continuous Integration/Continuous Deployment) pipelines.
- **Build custom Dashboards or reports** by querying platform data programmatically.

## Authentication

Every `/api/` endpoint requires authentication, except a few public ones such as `/api/login`. Two methods are supported.

### API key

Each user has one API key. It carries all the permissions of that user.

1. Open the profile menu in the top right corner and select **Profile**.
2. In the **API access** section, copy the **Token key**.
3. Send the key in the `Authorization` header of every request:

```http
Content-Type: application/json
Authorization: Bearer <API_KEY>
```

API key requests are stateless: the server creates no session for them.

!!! warning

    Keep your API key secret. If it leaks, click **RENEW** in **Profile > API access**: the old key stops working at once.

    Do not send cookies along with a bearer request. Requests that carry both are checked for a CSRF (Cross-Site Request Forgery) token, like browser requests.

### Session cookie

Session-based authentication is useful for scripts that simulate browser interactions.

1. Send a `POST` request to `/api/login` with a JSON body containing `login` (your email) and `password`.
2. Keep the `openaev_session` cookie from the response and send it with later requests.

```http
POST /api/login
Content-Type: application/json

{ "login": "user@example.com", "password": "<PASSWORD>" }
```

The session expires after 24 hours of inactivity by default.

!!! note

    Cookie sessions are protected against CSRF. `POST`, `PUT` and `DELETE` requests must send the value of the `XSRF-TOKEN` cookie in the `X-XSRF-TOKEN` header. Login does not set this cookie: the first such request returns `403` with the cookie, then retry with the header. For scripts, prefer an API key.

## API documentation (Swagger UI)

The API is described by an OpenAPI 3.1 specification and served through Swagger UI, where you can browse endpoints, inspect request and response schemas, and test calls from the browser after authenticating.

- **Swagger UI**: `https://<your-openaev-url>/swagger-ui/index.html`, also linked from **API specifications** in **Profile > API access**
- **OpenAPI schema (JSON)**: `https://<your-openaev-url>/api-docs`

## Common patterns

### Base URL

All API endpoints are prefixed with `/api/`. Tenant-scoped endpoints use the prefix `/api/tenants/{tenantId}/` instead (see [Multi-tenant context](#multi-tenant-context)).

The API uses JSON for request and response bodies. Include the `Content-Type: application/json` header in requests that carry a body.

### Pagination

Search endpoints take a `POST` request with the pagination input in the body:

```http
POST /api/scenarios/search
```

```json
{
  "page": 0,
  "size": 20,
  "textSearch": "ransomware",
  "sorts": [
    { "property": "scenario_name", "direction": "asc" }
  ],
  "filterGroup": {
    "mode": "and",
    "filters": []
  }
}
```

| Field | Type | Description |
|---|---|---|
| `page` | integer | Page number, zero-indexed. Default: `0` |
| `size` | integer | Number of elements per page. Default: `20`, maximum: `1000` |
| `textSearch` | string | Optional free-text search across searchable attributes |
| `sorts` | array | Sort fields, each with a `property` and an optional `direction` (`asc` by default, or `desc`) |
| `filterGroup` | object | Structured filter, see [Filtering](#filtering) |

The response wraps results in a page object:

```json
{
  "content": [ ... ],
  "totalElements": 142,
  "totalPages": 8,
  "number": 0,
  "size": 20
}
```

### Filtering

A `filterGroup` combines filters with `and` or `or`. Example: Scenarios with one of two tags and a `critical` severity:

```json
{
  "filterGroup": {
    "mode": "and",
    "filters": [
      {
        "id": "tags",
        "key": "scenario_tags",
        "mode": "or",
        "operator": "contains",
        "values": ["<TAG_ID_1>", "<TAG_ID_2>"]
      },
      {
        "id": "severity",
        "key": "scenario_severity",
        "operator": "eq",
        "values": ["critical"]
      }
    ]
  }
}
```

For the full format and the list of operators, see [Filters](filters.md).

### Bulk operations on Injects

Bulk update and bulk delete of Injects are scoped to their parent Scenario or Simulation. Authorization is checked on that parent, so users with the right access to it can work on its Injects without platform-wide privileges.

| Operation | Endpoint |
|---|---|
| Bulk update Injects of a Scenario | `PUT /api/scenarios/{scenarioId}/injects` |
| Bulk delete Injects of a Scenario | `DELETE /api/scenarios/{scenarioId}/injects` |
| Bulk update Injects of a Simulation | `PUT /api/exercises/{exerciseId}/injects` |
| Bulk delete Injects of a Simulation | `DELETE /api/exercises/{exerciseId}/injects` |

The body selects Injects either by ID (`inject_ids_to_process`) or by a search (`search_pagination_input`), not both. With a search, exclude Injects with `inject_ids_to_ignore`.

Example: delete two Injects of a Scenario.

```http
DELETE /api/scenarios/{scenarioId}/injects
```

```json
{
  "inject_ids_to_process": [
    "5f8317eb-e19f-4234-9d34-7b65a52ea82f",
    "9a4f9138-9163-40c2-bd21-b579d4a26428"
  ]
}
```

Calling these endpoints on a parent you cannot modify returns `403`.

!!! note

    Earlier versions exposed generic `PUT /api/injects` and `DELETE /api/injects` endpoints taking a `simulation_or_scenario_id` in the body. They are replaced by the scoped endpoints above.

### Error responses

| Code | Meaning |
|---|---|
| `400` | Bad request -- validation failed or malformed input |
| `401` | Unauthorized -- missing or invalid authentication |
| `403` | Forbidden -- authenticated but insufficient permissions |
| `404` | Not found -- resource does not exist or is not accessible |
| `409` | Conflict -- database constraint violation or resource lock |
| `429` | Too many requests -- rate limit reached, when [rate limiting](#rate-limiting) is enabled |
| `500` | Internal server error |

Validation errors (`400`) return per-field error messages. Other errors return a JSON body with a `message` field.

## Grant-scoped endpoints

Global inventory endpoints such as `/api/endpoints`, `/api/asset_groups` or `/api/injector_contracts` require the matching platform capability (Assets, Threat Arsenal). A user who only holds a grant on a Simulation or Scenario can use the Workflow API instead, which only exposes the elements its workflow references:

| Endpoint | Description |
|---|---|
| `GET /api/tenants/{tenantId}/workflows/{workflowId}/scope/endpoints` | Endpoints referenced by the workflow scope rules (allowlist and denylist) |
| `POST /api/tenants/{tenantId}/workflows/{workflowId}/scope/endpoints/find` | Same as above, restricted to the requested IDs |
| `GET /api/tenants/{tenantId}/workflows/{workflowId}/scope/asset-groups` | Asset groups referenced by the workflow scope rules |
| `POST /api/tenants/{tenantId}/workflows/{workflowId}/scope/asset-groups/find` | Same as above, restricted to the requested IDs |
| `GET /api/tenants/{tenantId}/workflows/{workflowId}/injector_contracts/{injectorContractId}` | An injector contract, returned only if a workflow step references it |

These endpoints check the caller's grant on the workflow's parent Simulation or Scenario, not the global capabilities. IDs that the workflow does not reference are ignored, so these endpoints cannot read arbitrary platform data.

!!! tip "Enterprise Edition"

    The Workflow API requires an Enterprise Edition license.

## Multi-tenant context

The API exposes two sets of endpoints:

- **Platform endpoints** stay under `/api/...` and handle platform-wide operations (e.g., Tenant management, platform settings).
- **Tenant-scoped endpoints** use the prefix `/api/tenants/{tenantId}/...`, where `{tenantId}` is the UUID of the target Tenant.

Most resource endpoints (Scenarios, Simulations, Assets, Teams) support both patterns. Accessing a Tenant you are not authorized for returns `403`. See [Multi-tenancy](../../administration/multi-tenancy.md).

## Rate limiting

Rate limiting is a preview feature, off by default. It runs only when `RATE_LIMITING` is listed in `openaev.enabled-dev-features`. When enabled, the default limits are:

| Requests | Default limit | Counted per |
|---|---|---|
| Not authenticated | 10 requests per second | Originating IP address, all endpoints together |
| Authenticated | 300 requests per second | User account and endpoint |

The unauthenticated limit also covers `/login`, `/oauth2`, `/saml2`, `/actuator` and `/xtm`.

Tune the limits in the [server configuration](../deployment/configuration.md#rate-limiting).

## What's next?

- [Filters](filters.md) -- Filter format and operators
- [API usage](../../development/api-usage.md) -- Examples of common API calls
- [Profile](../../administration/profile.md) -- Where to manage your account
