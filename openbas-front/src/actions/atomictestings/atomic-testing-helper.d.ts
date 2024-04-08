import type { AtomicTestingOutput, SimpleExpectationResultOutput } from '../../utils/api-types';

export interface AtomicTestingHelper {
  getAtomicTestings: () => AtomicTestingOutput[];
  getAtomicTesting: (atomicId: string) => AtomicTestingOutput;
  getTargetResults: (targetId: string, injectId: string) => SimpleExpectationResultOutput[];
}
