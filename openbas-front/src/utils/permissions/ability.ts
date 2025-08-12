import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from '@casl/ability';

import parseCapability, { parseGrant } from './parserRbac';
import { type Actions, type SubjectsType } from './types';

export type AppAbility = MongoAbility<[Actions, SubjectsType]>;

// TODO : Delete isAdmin when we remove this logic
export function defineAbility(capabilities: string[], grants: Record<string, string>, isAdmin: boolean): (AppAbility) {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility);
  if (isAdmin) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    can('manage', 'all');
  }
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

  // To use casl for grant : ability.can(ACTIONS.ACCESS, 'RESOURCE', '', { id: scenario.scenario_id }),
  for (const grant of Object.entries(grants)) {
    const parsedGrant = parseGrant(grant);
    if (parsedGrant) {
      const [action, subject, id] = parsedGrant;
      can(action, subject, id);
    }
  }

  console.log(JSON.stringify(rules));

  return createMongoAbility(rules);
}
