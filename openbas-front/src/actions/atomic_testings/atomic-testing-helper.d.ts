import type { AtomicTestingDetailOutput, AtomicTestingOutput, Inject, SimpleExpectationResultOutput } from '../../utils/api-types';

export interface AtomicTestingHelper {
  getAtomicTestings: () => AtomicTestingOutput[];
  getAtomicTesting: (atomicId: string) => AtomicTestingOutput;
  getAtomicTestingDetail: (atomicId: string) => AtomicTestingDetailOutput;
  getTargetResults: (targetId: string, injectId: string) => SimpleExpectationResultOutput[];
  getInject: (atomicId: string) => Inject;
}
