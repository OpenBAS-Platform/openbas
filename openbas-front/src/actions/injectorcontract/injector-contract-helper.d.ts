import type { InjectorContract } from '../../utils/api-types';

export interface InjectorContractHelper {
  getInjectorContracts: () => InjectorContract[];
  getInjectorContractsMap: () => Record<string, InjectorContract>;
}
