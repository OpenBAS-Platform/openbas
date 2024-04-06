import type { AtomicTestingOutput, TargetResult } from '../../utils/api-types';

export interface AtomicTestingHelper {
  getAtomicTestings: () => AtomicTestingOutput[];
  getAtomicTesting: (atomicId: string) => AtomicTestingOutput;
  getTargetResults: (targetId: string) => TargetResult;
}
