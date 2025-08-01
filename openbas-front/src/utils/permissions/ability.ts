import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from '@casl/ability';

import parseCapability from './parseCapability';
import { type Actions, type Subjects } from './types';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilityFromCapabilities(capabilities: string[]): (AppAbility) {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);

  for (const cap of capabilities) {
    if (cap === 'BYPASS') {
      // We ignore ts here to accept lowercase which are CASL default keys
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      can('manage', 'all'); // "manage" in lowercase means all actions, "all" means all subject
      continue;
    }

    const parsed = parseCapability(cap);
    if (parsed) {
      const [action, subject] = parsed;
      can(action, subject);
    }
  }
  return createMongoAbility(rules);
}
