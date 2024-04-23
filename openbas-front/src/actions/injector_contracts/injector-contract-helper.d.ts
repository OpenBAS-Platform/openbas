import type { InjectorContract } from '../../utils/api-types';

export interface InjectorContractHelper {
  getInjectorContracts: () => InjectorContract[];
  getInjectorContractsMap: () => Record<string, InjectorContract>;
  getInjectorContractsWithNoTeams: () => Contract['config']['type'][];
  getInjectorContractsMapByType: () => Record<string, Contract>;
}
