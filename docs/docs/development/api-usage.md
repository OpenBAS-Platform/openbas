# API usage

This page shows the common calls to the OpenAEV REST API from integrations, scripts or custom tools. For authentication, pagination, errors and the full list of endpoints, see [REST API](../reference/apis/rest-api.md).

## List resources

Most resources have a search endpoint with pagination, sorting and filtering:

```http
POST /api/scenarios/search
```

```json
{
  "page": 0,
  "size": 20,
  "sorts": [
    { "property": "scenario_name", "direction": "asc" }
  ]
}
```

## Create a resource

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

## Update a resource

Send a `PUT` request with the full resource data:

```http
PUT /api/scenarios/{scenarioId}
```

## Delete a resource

Send a `DELETE` request:

```http
DELETE /api/scenarios/{scenarioId}
```

## What's next?

- [REST API](../reference/apis/rest-api.md) -- Authentication, pagination, errors and Swagger UI
- [Filters](../reference/apis/filters.md) -- Filter format and operators
- [Platform development](platform.md) -- Set up a local development environment
