import { schema } from 'normalizr';

// Endpoint

export const endpoint = new schema.Entity(
  'endpoints',
  {},
  { idAttribute: 'asset_id' },
);
export const arrayOfEndpoints = new schema.Array(endpoint);
