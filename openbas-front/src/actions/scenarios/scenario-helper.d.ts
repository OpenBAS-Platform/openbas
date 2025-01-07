import type { LessonsCategory, LessonsQuestion, Objective, Scenario, Team } from '../../utils/api-types';

export interface ScenariosHelper {
  getScenario: (scenarioId: string) => Scenario;
  getScenarios: () => Scenario[];
  getScenarioTeams: (scenarioId: string) => Team[];
  getScenarioObjectives: (scenarioId: string) => Objective[];
  getScenarioLessonsCategories: (scenarioId: string) => LessonsCategory[];
  getScenarioLessonsQuestions: (scenarioId: string) => LessonsQuestion[];
}
