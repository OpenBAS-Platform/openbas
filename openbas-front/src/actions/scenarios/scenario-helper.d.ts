import type { ScenarioStore } from './Scenario';
import type { TeamStore } from '../teams/Team';
import type { Inject, Team } from '../../utils/api-types';

export interface ScenariosHelper {
  getScenario: (scenarioId: string) => ScenarioStore;
  getScenarios: () => ScenarioStore[];
  getScenarioTeams: (scenarioId: string) => TeamStore[];
  getScenarioTechnicalInjectsWithNoTeam: (scenarioId: string) => Inject[];
  getTeamScenarioInjects: (teamId: Team['team_id']) => Inject[];
}
