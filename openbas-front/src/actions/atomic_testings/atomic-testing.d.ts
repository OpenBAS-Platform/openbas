import { InjectExpectationsStore } from '../../admin/components/common/injects/expectations/Expectation';
import type { InjectResultDTO } from '../../utils/api-types';

export type InjectResultDTOStore = Omit<InjectResultDTO, 'atomic_expectations'> & {
  atomic_expectations: InjectExpectationsStore[] | undefined;
};
