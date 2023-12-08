import { schema } from 'normalizr';

// -- MOCK TYPE --

export interface ExpectationInput {
  expectation_type: string;
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
