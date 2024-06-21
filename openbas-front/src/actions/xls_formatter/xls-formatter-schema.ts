import { schema } from 'normalizr';

// Mappers
export const mapper = new schema.Entity(
  'mappers',
  {},
  { idAttribute: 'mapper_id' },
);
