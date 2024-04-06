import { schema } from 'normalizr';

export const targetResult = new schema.Entity(
  'target-results',
  {},
  { idAttribute: 'target_id' },
);
export const arrayOftargetResults = new schema.Array(targetResult);
