import {
  AbilityBuilder,
  createAliasResolver,
  createMongoAbility,
  type MongoAbility,
} from '@casl/ability';

import parseCapability from './parseCapability';
import { type Actions, type Subjects } from './types';

export type AppAbility = MongoAbility<[Actions, Subjects]>;
// const resolveAction = createAliasResolver({ MANAGE: ['update', 'create'] });

export function defineAbilityFromCapabilities(capabilities: string[]): AppAbility {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);

  for (const cap of capabilities) {
    if (cap === 'BYPASS') {
      // @ts-ignore
      can('manage', 'all');
      continue;
    }

    const parsed = parseCapability(cap);
    if (parsed) {
      const [action, subject] = parsed;
      can(action, subject);
    }
  }
  // return createMongoAbility(rules, { resolveAction });
  return createMongoAbility(rules);
}
