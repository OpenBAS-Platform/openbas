import { type APIRequestContext } from '@playwright/test';

import { TIMEOUT } from '../utils/constants';

interface TenantApiOutput {
  tenant_id: string;
  tenant_name: string;
}

class TenantApiHelpers {
  readonly tenantUri = '/api/tenants';

  constructor(private request: APIRequestContext) {}

  async createTenant(tenantName?: string): Promise<TenantApiOutput> {
    const data = { tenant_name: tenantName ?? `Tenant E2E ${Date.now()}` };
    // Creation runs every onboarding step (queues, per-tenant migrations, datapacks)
    // before answering, which can run past the 15s action budget on a loaded runner.
    const response = await this.request.post(this.tenantUri, {
      data,
      timeout: 3 * TIMEOUT,
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to create tenant (POST ${this.tenantUri}): ${response.status()} ${response.statusText()} - ${await response.text()}`,
      );
    }

    return (await response.json()) as TenantApiOutput;
  }

  async softDeleteTenant(tenantId: string): Promise<void> {
    await this.request.delete(`${this.tenantUri}/${tenantId}`);
  }
}

export default TenantApiHelpers;
