import type { Scenario, Team, User } from '../../utils/api-types';

export type ScenarioTeamUserStore = Omit<Scenario['scenario_teams_users'], 'scenario_id', 'team_id', 'user_id'> & {
  scenario_id?: Scenario['scenario_id'];
  team_id?: Team['team_id'];
  user_id?: User['user_id'];
};

export type ScenarioStore = Omit<Scenario, 'scenario_tags', 'scenario_teams_users'> & {
  scenario_tags: string[] | undefined;
  scenario_teams_users: ScenarioTeamUserStore;
};
