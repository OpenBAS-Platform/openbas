import type { Injector } from '../../utils/api-types';

export interface InjectorHelper {
  getInjectors: () => Injector[];
  getInjectorsMap: () => Record<string, Injector>;
}
