import { type APIRequestContext } from '@playwright/test';

import { MANUAL_INJECTOR_CONTRACT_ID } from '../utils/constants';
import { tenantApiPath } from '../utils/url';

class ScenarioApiHelpers {
  readonly scenarioUri = tenantApiPath('/api/scenarios');
  constructor(private request: APIRequestContext) {}

  async createScenario(name?: string, isChaining = false) {
    const response = await this.request.post(this.scenarioUri, {
      data: {
        scenario_name: name || `Scenario test e2e ${Date.now()}`,
        scenario_is_chaining: isChaining,
        scenario_category: 'attack-scenario',
        scenario_main_focus: 'incident-response',
        scenario_severity: 'high',
        scenario_subtitle: '',
        scenario_description: '',
        scenario_tags: [],
        scenario_external_reference: '',
        scenario_external_url: '',
        scenario_mail_from: 'openaev-dev@test.io',
        scenario_mails_reply_to: ['openaev-dev@test.io'],
        scenario_message_header: 'SIMULATION HEADER',
        scenario_message_footer: 'SIMULATION FOOTER',
      },
    });
    return response.json();
  }

  async renameScenario(id: string, name: string) {
    const response = await this.request.put(`${this.scenarioUri}/${id}`, {
      data: {
        scenario_name: name,
        scenario_category: 'attack-scenario',
        scenario_main_focus: 'incident-response',
        scenario_severity: 'high',
      },
    });
    if (!response.ok()) {
      throw new Error(`Failed to update scenario ${id}: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  // Adds an inject of the built-in manual contract, which needs no injector, target or content.
  async createManualInject(scenarioId: string, title: string) {
    const response = await this.request.post(`${this.scenarioUri}/${scenarioId}/injects`, {
      data: {
        inject_title: title,
        inject_injector_contract: MANUAL_INJECTOR_CONTRACT_ID,
        inject_content: {},
        inject_depends_duration: 0,
      },
    });
    if (!response.ok()) {
      throw new Error(`Failed to create an inject in scenario ${scenarioId}: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  async deleteScenario(id: string) {
    await this.request.delete(`${this.scenarioUri}/${id}`);
  }
}

export default ScenarioApiHelpers;
