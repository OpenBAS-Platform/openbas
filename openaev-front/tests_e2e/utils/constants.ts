// Path to the persisted Playwright storage state (cookies + localStorage).
export const AUTH_FILE = 'tests_e2e/.auth/user.json';

/** Default timeout (ms) used across E2E tests and page objects. */
export const TIMEOUT = 20_000;

/**
 * Extended timeout (ms) for tenant onboarding flows. Creating a tenant cascades through every
 * DependenciesManager (queue provisioning, per-tenant migrations/datapacks, ...) before
 * GET /api/me/tenants reflects the new tenant — this can exceed the default TIMEOUT under CI
 * load. Any wait gating on the post-creation tenant-list refresh should use this value instead
 * of racing the fixed TIMEOUT on the tenant-switcher's own visibility (see #7866).
 */
export const TENANT_ONBOARDING_TIMEOUT = 60_000;
