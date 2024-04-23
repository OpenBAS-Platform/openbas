import type { InjectorContract } from '../../utils/api-types';

export type InjectorContractStore = Omit<InjectorContract, 'injector_contract_attack_patterns'> & {
  injector_contract_attack_patterns: string[] | undefined
};
