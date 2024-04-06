import { schema } from 'normalizr';

export const targetResult = new schema.Entity(
  'targetresults',
  {},
  { idAttribute: 'target_result_id' },
);
export const arrayOftargetResults = new schema.Array(targetResult);
