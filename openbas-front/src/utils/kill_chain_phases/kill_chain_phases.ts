import { type KillChainPhase } from '../api-types';

// eslint-disable-next-line import-x/prefer-default-export
export const sortKillChainPhase = (k1: KillChainPhase, k2: KillChainPhase) => {
  return (k1.phase_order ?? 0) - (k2.phase_order ?? 0);
};
