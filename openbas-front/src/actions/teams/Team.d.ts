import type { Team, TeamUpdateInput } from '../../utils/api-types';
import { Option } from '../../utils/Option';

export type TeamInputForm = Omit<
  TeamUpdateInput,
'team_organization' | 'team_tags'
> & {
  team_organization: Option | undefined;
  team_tags: Option[];
};
export type TeamStore = Omit<Team, 'team_organization' | 'team_tags' | 'team_users'> & {
  team_organization: string | undefined;
  team_tags: string[] | undefined;
  team_users: string[] | undefined;
};
