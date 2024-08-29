import type { ScenarioStore } from './Scenario';
import type { TeamStore } from '../teams/Team';
import type { LessonsCategory, LessonsQuestion, Objective } from '../../utils/api-types';

export interface ScenariosHelper {
  getScenario: (scenarioId: string) => ScenarioStore;
  getScenarios: () => ScenarioStore[];
  getScenarioTeams: (scenarioId: string) => TeamStore[];
  getScenarioObjectives: (scenarioId: string) => Objective[];
  getScenarioLessonsCategories: (scenarioId: string) => LessonsCategory[];
  getScenarioLessonsQuestions: (scenarioId: string) => LessonsQuestion[];
}
