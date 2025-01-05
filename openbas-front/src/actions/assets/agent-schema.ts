import { schema } from 'normalizr';

// Agent

export const agent = new schema.Entity(
  'agents',
  {},
  { idAttribute: 'agent_id' },
);
export const arrayOfAgents = new schema.Array(agent);
