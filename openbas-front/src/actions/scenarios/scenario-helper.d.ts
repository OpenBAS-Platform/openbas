import type { LessonsCategory, LessonsQuestion, Objective, Team } from '../../utils/api-types';
import type { ScenarioStore } from './Scenario';

export interface ScenariosHelper {
  getScenario: (scenarioId: string) => ScenarioStore;
  getScenarios: () => ScenarioStore[];
  getScenarioTeams: (scenarioId: string) => Team[];
  getScenarioObjectives: (scenarioId: string) => Objective[];
  getScenarioLessonsCategories: (scenarioId: string) => LessonsCategory[];
  getScenarioLessonsQuestions: (scenarioId: string) => LessonsQuestion[];
}
