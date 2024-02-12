import { createContext } from 'react';
import type { Exercise } from '../utils/api-types';
import type { ScenarioStore } from '../actions/scenarios/Scenario';

type ExerciseOrScenario = { exercise?: Exercise, scenario?: ScenarioStore };

const ExerciseOrScenarioContext = createContext<ExerciseOrScenario>({});

export default ExerciseOrScenarioContext;
