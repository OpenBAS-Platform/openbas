import type { AtomicTestingDetailOutput } from '../../utils/api-types';
import { InjectExpectationsStore } from '../../admin/components/common/injects/expectations/Expectation';

export type AtomicTestingDetailOutputStore = Omit<AtomicTestingDetailOutput, 'atomic_expectations'> & {
  atomic_expectations: InjectExpectationsStore[] | undefined
};
