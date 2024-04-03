import type { KillChainPhase } from './api-types';

const extractKillChainPhaseExternalId = (killChainPhase: KillChainPhase) => {
  const start = killChainPhase.phase_external_id.indexOf('TA') + 'TA'.length;
  const externalId = killChainPhase.phase_external_id.substring(start);
  return parseInt(externalId, 10);
};

export default extractKillChainPhaseExternalId;
