import type { AtomicTestingOutput, ExpectationResultOutput, Inject, InjectResultDTO } from '../../utils/api-types';
import type { AtomicTestingDetailOutputStore } from './atomic-testing';

export interface AtomicTestingHelper {
  getAtomicTestings: () => AtomicTestingOutput[];
  getAtomicTesting: (atomicId: string) => InjectResultDTO | undefined;
  getAtomicTestingDetail: (atomicId: string) => AtomicTestingDetailOutputStore;
  getTargetResults: (targetId: string, injectId: string) => ExpectationResultOutput[];
  getInject: (atomicId: string) => Inject;
}
