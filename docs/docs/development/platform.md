# Platform development

This page explains how to set up a local development environment for the OpenAEV platform, covering both the backend (Java/Spring Boot) and the frontend (React/TypeScript).

## Prerequisites

Before starting, install the required tools for your operating system:

- [Prerequisites Ubuntu](environment-ubuntu.md)
- [Prerequisites macOS](environment-macos.md)
- [Prerequisites Windows](environment-windows.md)

## Architecture overview

OpenAEV is a multi-module Maven project with a React frontend:

| Module | Role |
|---|---|
| `openaev-model` | JPA entities, repositories, domain models |
| `openaev-api` | REST API, services, Flyway migrations, main application |
| `openaev-front` | React SPA (Single Page Application) |
| `openaev-build-services` | Compile-time annotation processing |
| `openaev-maven-plugin` | Maven goals that generate a migration file and the OCSF (Open Cybersecurity Schema Framework) parser |
| `openaev-ocsf` | OCSF schema classes |
| `openaev-es8-client`, `openaev-es9-client`, `openaev-opensearch-client` | Shaded search engine clients |
| `openaev-framework` | Shared abstractions (deprecated -- do not add new code here) |

## Starting development services

1. Copy the example configuration files:

    ```bash
    cp openaev-dev/.env.example openaev-dev/.env
    cp openaev-api/src/main/resources/application-dev.properties.example \
       openaev-api/src/main/resources/application-dev.properties
    ```

2. Start the backend dependencies with Docker Compose (or `podman compose`):

    ```bash
    cd openaev-dev
    docker compose up -d openaev-dev-pgsql openaev-dev-minio openaev-dev-elasticsearch openaev-dev-rabbitmq
    ```

See `openaev-dev/README.md` for the optional services and their ports.

## Building the backend

1. Build all modules:

    ```bash
    mvn clean install -DskipTests
    ```

2. Check code formatting with Google Java Format:

    ```bash
    mvn spotless:check
    ```

3. Auto-fix formatting issues:

    ```bash
    mvn spotless:apply
    ```

## Running the backend

Run the main class `io.openaev.App` from your IDE with the `dev` profile, or use Maven:

```bash
mvn spring-boot:run -pl openaev-api -Dspring-boot.run.profiles=dev
```

The backend starts on port `8080` by default.

## Building the frontend

1. Navigate to the frontend directory and install dependencies:

    ```bash
    cd openaev-front
    yarn install
    ```

2. Start the development server:

    ```bash
    yarn start
    ```

The frontend dev server starts on port `3001` and proxies API requests to the backend on port `8080`.

## Running tests

### Backend tests

```bash
mvn test                                          # Run all tests
mvn test -pl openaev-api -Dtest=MyTestClass       # Run a single test class
mvn test -pl openaev-api -Dtest=MyTestClass#myMethod  # Run a single test method
mvn jacoco:check                                  # Check coverage thresholds (does not fail the build)
```

!!! note

    Backend tests use the test services, not the dev ones. Start them before running tests:

    ```bash
    cd openaev-dev
    docker compose up -d openaev-test-pgsql openaev-test-minio openaev-test-elasticsearch openaev-dev-rabbitmq
    ```

### Frontend tests

```bash
cd openaev-front
yarn lint                  # ESLint (must pass with 0 warnings)
yarn check-ts              # TypeScript type checking
yarn test                  # Unit tests (Vitest)
yarn test:e2e              # E2E tests (Playwright, requires running application)
```

## Code style

- **Backend**: Google Java Format, enforced by Spotless. Run `mvn spotless:apply` before committing.
- **Frontend**: ESLint with strict rules. Run `yarn lint` before committing.

## What's next?

- [Build from source](build-from-source.md) -- Detailed build and packaging instructions
- [Database migrations](database-migrations.md) -- Flyway migration guide
- [Tenant isolation](tenant-isolation.md) -- Rules for code that touches tenant-isolated tables
- [Injectors](injectors.md) -- Develop custom Injectors
- [Collectors](collectors.md) -- Develop custom Collectors
