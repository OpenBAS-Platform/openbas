import type { AtomicTestingDetailOutput, AtomicTestingOutput, SimpleExpectationResultOutput } from '../../utils/api-types';

export interface AtomicTestingHelper {
  getAtomicTestings: () => AtomicTestingOutput[];
  getAtomicTesting: (atomicId: string) => AtomicTestingOutput;
  getAtomicTestingDetail: (atomicId: string) => AtomicTestingDetailOutput;
  getTargetResults: (targetId: string, injectId: string) => SimpleExpectationResultOutput[];
}
