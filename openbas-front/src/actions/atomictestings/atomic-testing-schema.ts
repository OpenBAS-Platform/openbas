import { schema } from 'normalizr';

export const atomicTesting = new schema.Entity(
  'injects',
  {},
  { idAttribute: 'inject_id' },
);
export const arrayOfAtomicTestings = new schema.Array(atomicTesting);
