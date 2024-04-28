import type { Inject, InjectExpectation } from '../../utils/api-types';

export type InjectInput = {
  inject_injector_contract: { id: string, type: string };
  inject_tags: string[];
  inject_depends_duration_days: number;
  inject_depends_duration_hours: number;
  inject_depends_duration_minutes: number;
  inject_depends_duration_seconds: number;
};

export type InjectStore = Omit<Inject, 'inject_tags' | 'inject_content' | 'inject_injector_contract'> & {
  inject_tags: string[] | undefined;
  inject_content: { expectationScore: number, challenges: string[] | undefined }
  inject_injector_contract: {
    // as we don't know the type of the content of a contract we need to put any here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injector_contract_content_parsed: any
  } & Inject['inject_injector_contract']
};

export type InjectExpectationStore = Omit<InjectExpectation, 'inject_expectation_team', 'inject_expectation_inject'> & {
  inject_expectation_team: string | undefined;
  inject_expectation_inject: string | undefined;
};
