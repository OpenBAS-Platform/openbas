import type { Inject, InjectExpectation, InjectOutput } from '../../utils/api-types';

export type InjectStore = Omit<Inject, 'inject_tags' | 'inject_content' | 'inject_injector_contract' | 'inject_teams' | 'inject_exercise' | 'inject_scenario'> & {
  inject_tags: string[] | undefined;
  inject_teams: string[] | undefined;
  inject_content: { expectationScore: number, challenges: string[] | undefined }
  inject_injector_contract: {
    // as we don't know the type of the content of a contract we need to put any here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injector_contract_content_parsed: any
    convertedContent: {
      label: Record<string, string>
      config: {
        expose: boolean
      }
    }
  } & Inject['inject_injector_contract']
  inject_exercise?: string
  inject_scenario?: string
};

export type InjectorContractConvertedContent = {
  label: Record<string, string>
  config: {
    expose: boolean
  }
};

export type InjectOutputType = InjectOutput & {
  inject_injector_contract: {
    // as we don't know the type of the content of a contract we need to put any here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injector_contract_content_parsed: any
    convertedContent: InjectorContractConvertedContent
  } & Inject['inject_injector_contract']
};

export type InjectExpectationStore = Omit<InjectExpectation, 'inject_expectation_team', 'inject_expectation_inject'> & {
  inject_expectation_team: string | undefined;
  inject_expectation_inject: string | undefined;
};
