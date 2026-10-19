import { type APIRequestContext } from '@playwright/test';

import { type Exercise } from '../../src/utils/api-types';
import { tenantApiPath } from '../utils/url';

const simulationInput = (name: string) => ({
  exercise_name: name,
  exercise_category: 'attack-scenario',
  exercise_main_focus: 'incident-response',
  exercise_severity: 'high',
  exercise_subtitle: '',
  exercise_description: '',
  exercise_tags: [],
  exercise_mails_reply_to: ['openaev-dev@test.io'],
  exercise_message_header: 'SIMULATION HEADER',
  exercise_message_footer: 'SIMULATION FOOTER',
});

class SimulationApiHelpers {
  readonly simulationUri = tenantApiPath('/api/exercises');
  constructor(private request: APIRequestContext) {}

  async createSimulation(name?: string): Promise<Exercise> {
    const response = await this.request.post(this.simulationUri, { data: simulationInput(name ?? `Simulation test e2e ${Date.now()}`) });
    if (!response.ok()) {
      throw new Error(`Failed to create simulation: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  async renameSimulation(id: string, name: string): Promise<Exercise> {
    const response = await this.request.put(`${this.simulationUri}/${id}`, { data: simulationInput(name) });
    if (!response.ok()) {
      throw new Error(`Failed to update simulation ${id}: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  async deleteSimulation(id: string) {
    await this.request.delete(`${this.simulationUri}/${id}`);
  }
}

export default SimulationApiHelpers;
