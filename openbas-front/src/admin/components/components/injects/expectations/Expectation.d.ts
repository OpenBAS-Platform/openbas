import type { InjectExpectation } from '../../../../../utils/api-types';

export interface InjectExpectationsStore extends Omit<InjectExpectation, 'inject_expectation_team'> {
  inject_expectation_team: string | undefined;
  inject_expectation_article: string | undefined;
  inject_expectation_challenge: string | undefined;
  inject_expectation_asset: string | undefined;
}

export interface ExpectationInput {
  expectation_type: string;
  expectation_name: string;
  expectation_description?: string;
  expectation_score: number;
  expectation_expectation_group: boolean;
}
