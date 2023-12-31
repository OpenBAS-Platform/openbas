import type { TeamUpdateInput, User } from '../../../../utils/api-types';
import { Option } from '../../../../utils/Option';

export type TeamInputForm = Omit<
TeamUpdateInput,
'team_organization' | 'team_tags'
> & {
  team_organization: Option | undefined;
  team_tags: Option[];
};
export type TeamStore = Omit<User, 'team_organization' | 'team_tags'> & {
  team_id: string | undefined,
  team_organization: string | undefined;
  team_tags: string[] | undefined;
};
