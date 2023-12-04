import { Exercise, Inject } from '../utils/api-types';
import { schema } from 'normalizr';

// -- MOCK TYPE --

export interface ExpectationInput {
  expectation_name: string;
  expectation_description?: string;
  expectation_score: number;
}

// -- SCHEMA --

export const expectation = new schema.Entity(
  'expectations',
  {},
  { idAttribute: 'expectation_id' },
);
export const arrayOfExpectations = new schema.Array(expectation);

// -- HELPER --

export interface ExpectationsHelper {
  getExerciseInjectExpectations: (exerciseId: Exercise['exercise_id'], injectId: Inject['inject_id']) => [ExpectationInput];
}
