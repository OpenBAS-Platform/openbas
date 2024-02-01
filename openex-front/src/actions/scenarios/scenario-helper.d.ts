import { ScenarioStore } from './Scenario';

export interface ScenariosHelper {
  getScenario: (scenarioId: string) => ScenarioStore;
  getScenarios: () => ScenarioStore[];
}
