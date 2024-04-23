import type { Inject, InjectExpectation } from '../../utils/api-types';

export type InjectInput = {
  inject_contract: { id: string, type: string };
  inject_tags: string[];
  inject_depends_duration_days: number;
  inject_depends_duration_hours: number;
  inject_depends_duration_minutes: number;
  inject_depends_duration_seconds: number;
};

export type InjectStore = Omit<Inject, 'inject_tags' | 'inject_content'> & {
  inject_tags: string[] | undefined;
  inject_content: { expectationScore: number, challenges: string[] | undefined }
};

export type InjectExpectationStore = Omit<InjectExpectation, 'inject_expectation_team', 'inject_expectation_inject'> & {
  inject_expectation_team: string | undefined;
  inject_expectation_inject: string | undefined;
};
