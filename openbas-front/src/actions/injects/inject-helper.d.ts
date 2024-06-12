import type { Exercise, Inject, Scenario, InjectExpectation, Team } from '../../utils/api-types';

export interface InjectHelper {
  getExerciseInjects: (exerciseId: Exercise['exercise_id']) => Inject[];
  getScenarioInjects: (scenarioId: Scenario['scenario_id']) => Inject[];
  getExerciseInjectExpectations: (scenarioId: Scenario['scenario_id']) => InjectExpectation[];
  getExerciseTechnicalInjectsWithNoTeam: (exerciseId: Exercise['exercise_id']) => Inject[];
  getInjectsMap: () => Record<string, Inject>;
  getInject: (injectId: Inject['inject_id']) => Inject;
  getTeamExerciseInjects: (teamId: Team['team_id']) => Inject[];
}
