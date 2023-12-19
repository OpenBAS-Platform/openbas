import type { InjectExpectation } from '../../../../../utils/api-types';

export interface InjectExpectationsStore extends Omit<InjectExpectation, 'inject_expectation_audience'> {
  inject_expectation_audience: string | undefined;
  inject_expectation_article: string | undefined;
  inject_expectation_challenge: string | undefined;
}

export interface ExpectationInput {
  expectation_type: string;
  expectation_name: string;
  expectation_description?: string;
  expectation_score: number;
}
