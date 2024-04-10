import { schema } from 'normalizr';

export const atomicTesting = new schema.Entity(
  'atomics',
  {},
  { idAttribute: 'atomic_id' },
);
export const arrayOfAtomicTestings = new schema.Array(atomicTesting);

export const atomicTestingDetail = new schema.Entity(
  'atomicdetails',
  {},
  { idAttribute: 'atomic_id' },
);
export const arrayOfAtomicTestingDetails = new schema.Array(atomicTestingDetail);
