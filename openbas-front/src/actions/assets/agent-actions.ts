import { Dispatch } from 'redux';

import { delReferential } from '../../utils/Action';
import type { Agent } from '../../utils/api-types';
import { agent } from './agent-schema';

const AGENT_URI = '/api/agents';

export const deleteAgent = (agentId: Agent['agent_id']) => (dispatch: Dispatch) => {
  const uri = `${AGENT_URI}/${agentId}`;
  return delReferential(uri, agent.key, agentId)(dispatch);
};

export default deleteAgent;
