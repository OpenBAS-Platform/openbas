import type { Contract, Exercise, Inject, InjectExpectation, Scenario } from '../../utils/api-types';

export interface InjectHelper {
  getExerciseInjects: (exerciseId: Exercise['exercise_id']) => Inject[];
  getScenarioInjects: (scenarioId: Scenario['scenario_id']) => Inject[];
  getInjectTypesMap: () => Record<string, Contract>;
  getInjectTypesWithNoTeams: () => Contract['config']['type'][];
  getInjectTypesMapByType: () => Record<string, Contract>;
  getExerciseInjectExpectations: (scenarioId: Scenario['scenario_id']) => InjectExpectation[];
  getInjectsMap: () => Record<string, Inject>;
}
