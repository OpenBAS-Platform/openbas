import { schema } from 'normalizr';

export const tagrule = new schema.Entity(
  'tagrules',
  {},
  { idAttribute: 'tag_rule_id' },
);
export const arrayOfTagrules = new schema.Array(tagrule);
