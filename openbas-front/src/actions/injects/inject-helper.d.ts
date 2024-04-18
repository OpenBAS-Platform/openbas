import type { Contract, Exercise, Inject, Scenario } from '../../utils/api-types';

export interface InjectHelper {
  getExerciseInjects: (exerciseId: Exercise['exercise_id']) => Inject[];
  getScenarioInjects: (scenarioId: Scenario['scenario_id']) => Inject[];
  getInjectTypesMap: () => Record<string, Contract>;
  getInjectTypesWithNoTeams: () => Contract['config']['type'][];
}
