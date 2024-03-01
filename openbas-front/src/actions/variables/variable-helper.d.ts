import type { Exercise, Variable } from '../../utils/api-types';
import type { ScenarioStore } from '../scenarios/Scenario';

export interface VariablesHelper {
  getExerciseVariables: (exerciseId: Exercise['exercise_id']) => Variable[];
  getScenarioVariables: (scenarioId: ScenarioStore['scenario_id']) => Variable[];
}
