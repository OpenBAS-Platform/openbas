import { schema } from 'normalizr';

export const atomicTesting = new schema.Entity(
  'atomics',
  {},
  { idAttribute: 'inject_id' },
);

export const atomicTestingDetail = new schema.Entity(
  'atomicdetails',
  {},
  { idAttribute: 'inject_id' },
);
