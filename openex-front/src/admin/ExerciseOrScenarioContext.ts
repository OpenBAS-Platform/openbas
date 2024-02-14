import { createContext } from 'react';
import type { Exercise, Variable, VariableInput } from '../utils/api-types';
import type { ScenarioStore } from '../actions/scenarios/Scenario';

export type VariableContext = {
  permissions: { readOnly: boolean, canWrite: boolean },
  onCreateVariable: (variable: VariableInput) => void,
  onEditVariable: (variable: Variable, data: VariableInput) => void,
  onDeleteVariable: (variable: Variable) => void,
}

export type ExerciseOrScenario = VariableContext;

const ExerciseOrScenarioContext = createContext<ExerciseOrScenario | null>(null);

export default ExerciseOrScenarioContext;
