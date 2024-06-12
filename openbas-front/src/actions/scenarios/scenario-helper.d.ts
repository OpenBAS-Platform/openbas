import type { ScenarioStore } from './Scenario';
import type { TeamStore } from '../teams/Team';

export interface ScenariosHelper {
  getScenario: (scenarioId: string) => ScenarioStore;
  getScenarios: () => ScenarioStore[];
  getScenarioTeams: (scenarioId: string) => TeamStore[];
}
