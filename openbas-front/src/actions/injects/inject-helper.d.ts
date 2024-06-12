import type { Exercise, Inject, Scenario, InjectExpectation, Team } from '../../utils/api-types';

export interface InjectHelper {
  getInject: (injectId: Inject['inject_id']) => Inject;
  getInjectsMap: () => Record<string, Inject>;

  getExerciseInjects: (exerciseId: Exercise['exercise_id']) => Inject[];
  getExerciseInjectExpectations: (scenarioId: Scenario['scenario_id']) => InjectExpectation[];
  getExerciseTechnicalInjectsWithNoTeam: (exerciseId: Exercise['exercise_id']) => Inject[];
  getTeamExerciseInjects: (teamId: Team['team_id']) => Inject[];

  getScenarioInjects: (scenarioId: Scenario['scenario_id']) => Inject[];
  getScenarioTechnicalInjectsWithNoTeam: (scenarioId: Scenario['scenario_id']) => Inject[];
  getTeamScenarioInjects: (teamId: Team['team_id']) => Inject[];
}
