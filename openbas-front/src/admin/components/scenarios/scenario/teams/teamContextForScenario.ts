import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { addScenarioTeamPlayers, disableScenarioTeamPlayers, enableScenarioTeamPlayers, removeScenarioTeamPlayers } from '../../../../../actions/scenarios/scenario-actions';
import { addScenarioTeams, removeScenarioTeams, replaceScenarioTeams, searchScenarioTeams } from '../../../../../actions/scenarios/scenario-teams-action';
import type { TeamStore } from '../../../../../actions/teams/Team';
import { addTeam, fetchTeams } from '../../../../../actions/teams/team-actions';
import type { Page } from '../../../../../components/common/queryable/Page';
import type { SearchPaginationInput, Team, TeamCreateInput, TeamOutput } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { UserStore } from '../../../teams/players/Player';

const teamContextForScenario = (scenarioId: ScenarioStore['scenario_id'], scenarioTeamsUsers: ScenarioStore['scenario_teams_users']) => {
  const dispatch = useAppDispatch();

  return {
    async onAddUsersTeam(teamId: Team['team_id'], userIds: UserStore['user_id'][]): Promise<void> {
      await dispatch(addScenarioTeamPlayers(scenarioId, teamId, { scenario_team_players: userIds }));
      return dispatch(fetchTeams());
    },
    async onRemoveUsersTeam(teamId: Team['team_id'], userIds: UserStore['user_id'][]): Promise<void> {
      await dispatch(removeScenarioTeamPlayers(scenarioId, teamId, { scenario_team_players: userIds }));
      return dispatch(fetchTeams());
    },
    onAddTeam(teamId: Team['team_id']): Promise<void> {
      return dispatch(addScenarioTeams(scenarioId, { scenario_teams: [teamId] }));
    },
    onCreateTeam(team: TeamCreateInput): Promise<{ result: string }> {
      return dispatch(addTeam({ ...team, team_scenarios: [scenarioId] }));
    },
    checkUserEnabled(teamId: Team['team_id'], userId: UserStore['user_id']): boolean {
      return scenarioTeamsUsers.filter((o: ScenarioStore['scenario_teams_users']) => o.scenario_id === scenarioId && o.team_id === teamId && userId === o.user_id).length > 0;
    },
    computeTeamUsersEnabled(teamId: Team['team_id']) {
      return scenarioTeamsUsers.filter((o: ScenarioStore['scenario_teams_users']) => o.team_id === teamId).length;
    },
    onRemoveTeam(teamId: Team['team_id']): void {
      dispatch(removeScenarioTeams(scenarioId, { scenario_teams: [teamId] }));
    },
    onReplaceTeam(teamIds: Team['team_id'][]): Promise<{ result: string[]; entities: { teams: Record<string, TeamStore> } }> {
      return dispatch(replaceScenarioTeams(scenarioId, { scenario_teams: teamIds }));
    },
    onToggleUser(teamId: Team['team_id'], userId: UserStore['user_id'], userEnabled: boolean): void {
      if (userEnabled) {
        dispatch(disableScenarioTeamPlayers(scenarioId, teamId, { scenario_team_players: [userId] }));
      } else {
        dispatch(enableScenarioTeamPlayers(scenarioId, teamId, { scenario_team_players: [userId] }));
      }
    },
    searchTeams(input: SearchPaginationInput, contextualOnly?: boolean): Promise<{ data: Page<TeamOutput> }> {
      return searchScenarioTeams(scenarioId, input, contextualOnly);
    },
  };
};

export default teamContextForScenario;