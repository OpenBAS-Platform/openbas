import { schema } from 'normalizr';
import type { ExpectationResultOutput } from '../../utils/api-types';

// FIXME: do we really need this ?

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

const targetIdAttribute = (value: ExpectationResultOutput) => `${value.target_id}_${value.target_inject_id}_${value.target_result_type}`;

export const targetResult = new schema.Entity(
  'targetresults',
  {},
  { idAttribute: targetIdAttribute },
);
export const arrayOftargetResults = new schema.Array(targetResult);
