# API usage

This page shows how to call the OpenAEV REST API from integrations, scripts or custom tools. For the full reference, see [REST API](../reference/apis/rest-api.md).

## Authentication

Every request needs an API key in the `Authorization` header:

```http
Content-Type: application/json
Authorization: Bearer <API_KEY>
```

Generate the key from your user profile. It has the permissions of the user who created it.

## Base URL

All endpoints start with `/api/`. In a multi-tenant setup, Tenant-scoped endpoints use `/api/tenants/{tenantId}/` (see [Multi-tenant context](../reference/apis/rest-api.md#multi-tenant-context)).

## Common operations

### List resources

Most resources have a search endpoint with pagination, sorting and filtering. `size` is at most 1000:

```http
POST /api/scenarios/search
```

```json
{
  "page": 0,
  "size": 20,
  "textSearch": "",
  "sorts": [
    { "property": "scenario_name", "direction": "asc" }
  ],
  "filterGroup": {
    "mode": "and",
    "filters": []
  }
}
```

### Create a resource

Send a `POST` request with the resource data:

```http
POST /api/scenarios
```

```json
{
  "scenario_name": "APT28 phishing campaign",
  "scenario_description": "Simulates a spear-phishing attack chain",
  "scenario_severity": "high"
}
```

### Update a resource

Send a `PUT` request with the full resource data:

```http
PUT /api/scenarios/{scenarioId}
```

### Delete a resource

Send a `DELETE` request:

```http
DELETE /api/scenarios/{scenarioId}
```

## Discovering endpoints

The OpenAPI schema lists every endpoint with its request and response models:

- **Swagger UI**: `https://<your-openaev-url>/swagger-ui/index.html`
- **OpenAPI schema (JSON)**: `https://<your-openaev-url>/api-docs`

## Filtering

Search endpoints accept a `filterGroup` object. See [Filters](../reference/apis/filters.md) for the format.

## Error handling

The API returns standard HTTP status codes:

| Code | Meaning | Action |
|---|---|---|
| `400` | Validation failed | Check the `errors` object in the response for field-level messages |
| `401` | Authentication failed | Verify your API key |
| `403` | Insufficient permissions | Check the user's roles and capabilities |
| `404` | Resource not found | Verify the resource ID |
| `409` | Conflict (database constraint or lock) | Check for a duplicate, or retry |
| `500` | Server error | Retry or report the issue |

## What's next?

- [REST API](../reference/apis/rest-api.md) -- Full API reference, including session login and rate limits
- [Filters](../reference/apis/filters.md) -- Filter format
- [Platform development](platform.md) -- Set up a local development environment
