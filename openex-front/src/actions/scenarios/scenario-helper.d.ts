import { ScenarioStore } from './Scenario';
import { TeamStore } from '../../admin/components/persons/teams/Team';

export interface ScenariosHelper {
  getScenario: (scenarioId: string) => ScenarioStore;
  getScenarios: () => ScenarioStore[];
  getScenarioTeams: (scenarioId: string) => TeamStore[];
}
