import type { InjectorContract } from '../../utils/api-types';

export type InjectorContractStore = Omit<InjectorContract, 'injectors_contracts_attack_patterns'> & {
  injectors_contracts_attack_patterns: string[] | undefined
};
