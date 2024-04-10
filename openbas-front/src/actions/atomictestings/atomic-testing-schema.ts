import { schema } from 'normalizr';

export const atomicTesting = new schema.Entity(
  'atomics',
  {},
  { idAttribute: 'atomic_id' },
);
export const arrayOfAtomicTestings = new schema.Array(atomicTesting);
