import { InjectExpectation } from '../../../../../utils/api-types';

export interface InjectExpectationsStore extends Omit<InjectExpectation, 'inject_expectation_audience'> {
  inject_expectation_audience: string | undefined;
}
