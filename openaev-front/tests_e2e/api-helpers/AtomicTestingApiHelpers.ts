import { type APIRequestContext } from '@playwright/test';

import { type InjectResultOverviewOutput } from '../../src/utils/api-types';
import { MANUAL_INJECTOR_CONTRACT_ID } from '../utils/constants';
import { tenantApiPath } from '../utils/url';

const atomicTestingInput = (title: string) => ({
  inject_title: title,
  inject_injector_contract: MANUAL_INJECTOR_CONTRACT_ID,
  inject_content: {},
  inject_all_teams: false,
});

class AtomicTestingApiHelpers {
  readonly atomicTestingUri = tenantApiPath('/api/atomic-testings');
  constructor(private request: APIRequestContext) {}

  async createAtomicTesting(title?: string): Promise<InjectResultOverviewOutput> {
    const response = await this.request.post(this.atomicTestingUri, { data: atomicTestingInput(title ?? `Atomic testing e2e ${Date.now()}`) });
    if (!response.ok()) {
      throw new Error(`Failed to create atomic testing: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  async renameAtomicTesting(id: string, title: string): Promise<InjectResultOverviewOutput> {
    const response = await this.request.put(`${this.atomicTestingUri}/${id}`, { data: atomicTestingInput(title) });
    if (!response.ok()) {
      throw new Error(`Failed to update atomic testing ${id}: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  async deleteAtomicTesting(id: string) {
    await this.request.delete(`${this.atomicTestingUri}/${id}`);
  }
}

export default AtomicTestingApiHelpers;
