import { schema } from 'normalizr';

export const atomicTesting = new schema.Entity(
  'atomics',
  {},
  { idAttribute: 'atomic_id' },
);

export const atomicTestingDetail = new schema.Entity(
  'atomicdetails',
  {},
  { idAttribute: 'atomic_id' },
);
