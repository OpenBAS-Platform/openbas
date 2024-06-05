import type { ExpectationResultOutput, InjectResultDTO } from '../../utils/api-types';
import type { InjectResultDTOStore } from './atomic-testing';

export interface AtomicTestingHelper {
  getAtomicTestings: () => InjectResultDTO[];
  getAtomicTesting: (atomicId: string) => InjectResultDTO | undefined;
  getAtomicTestingDetail: (atomicId: string) => InjectResultDTOStore;
  getTargetResults: (targetId: string, injectId: string) => ExpectationResultOutput[];
}
