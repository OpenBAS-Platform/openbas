import type { APIRequestContext } from '@playwright/test';

import { tenantApiPath } from '../utils/url';

export interface E2eEndpoint {
  asset_id: string;
  asset_name: string;
}

export interface EndpointFields {
  name: string;
  hostname: string;
  macAddress: string;
}

const endpointInput = ({ name, hostname, macAddress }: EndpointFields) => ({
  asset_name: name,
  asset_hostname: hostname,
  asset_tags: [],
  asset_ips: ['10.10.10.10'],
  asset_mac_addresses: [macAddress],
  endpoint_platform: 'Linux',
  endpoint_arch: 'x86_64',
});

/** Locally administered MAC address, unique enough to identify one test endpoint. */
export const randomMacAddress = () => `02:${Array.from({ length: 5 }, () => Math.floor(Math.random() * 256)
  .toString(16)
  .padStart(2, '0')).join(':')}`;

class EndpointApiHelpers {
  readonly endpointUri = tenantApiPath('/api/endpoints');
  readonly assetUri = tenantApiPath('/api/assets');
  constructor(private request: APIRequestContext) {}

  async createAgentlessEndpoint(fields: EndpointFields): Promise<E2eEndpoint> {
    const response = await this.request.post(`${this.endpointUri}/agentless`, { data: endpointInput(fields) });
    if (!response.ok()) {
      throw new Error(`Endpoint creation failed: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  async updateEndpoint(id: string, fields: EndpointFields) {
    const response = await this.request.put(`${this.endpointUri}/${id}`, { data: endpointInput(fields) });
    if (!response.ok()) {
      throw new Error(`Endpoint update failed: ${response.status()} ${await response.text()}`);
    }
  }

  /**
   * Registers an agent the way an installed agent does: the first call creates the endpoint and its
   * agent, a later call with the same identity updates that agent.
   */
  async registerAgent(fields: EndpointFields, executedByUser: string, agentVersion: string): Promise<E2eEndpoint> {
    const response = await this.request.post(`${this.endpointUri}/register`, {
      data: {
        ...endpointInput(fields),
        asset_external_reference: `e2e-${fields.macAddress}`,
        agent_executed_by_user: executedByUser,
        agent_is_service: true,
        agent_is_elevated: true,
        endpoint_agent_version: agentVersion,
      },
    });
    if (!response.ok()) {
      throw new Error(`Agent registration failed: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  async deleteAsset(id: string) {
    await this.request.delete(`${this.assetUri}/${id}`);
  }
}

export default EndpointApiHelpers;
