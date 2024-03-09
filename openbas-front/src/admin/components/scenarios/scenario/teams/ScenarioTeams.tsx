import { useParams } from 'react-router-dom';
import React, { useContext } from 'react';
import { makeStyles } from '@mui/styles';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../../utils/hooks';
import {
  addScenarioTeamPlayers,
  addScenarioTeams,
  disableScenarioTeamPlayers,
  enableScenarioTeamPlayers,
  fetchScenarioTeams,
  removeScenarioTeamPlayers,
  removeScenarioTeams,
} from '../../../../../actions/scenarios/scenario-actions';
import DefinitionMenu from '../../../components/DefinitionMenu';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import type { TeamStore } from '../../../../../actions/teams/Team';
import Teams from '../../../components/teams/Teams';
import { PermissionsContext, TeamContext, TeamContextType } from '../../../components/Context';
import type { Team, TeamCreateInput } from '../../../../../utils/api-types';
import { addTeam, fetchTeams } from '../../../../../actions/teams/team-actions';
import type { UserStore } from '../../../teams/players/Player';
import AddTeams from '../../../components/teams/AddTeams';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

interface Props {
  scenarioTeamsUsers: ScenarioStore['scenario_teams_users'],
}

const ScenarioTeams: React.FC<Props> = ({ scenarioTeamsUsers }) => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  const { teams }: { scenario: ScenarioStore, teams: TeamStore[] } = useHelper((helper: ScenariosHelper) => ({
    teams: helper.getScenarioTeams(scenarioId),
  }));

  const { permissions } = useContext(PermissionsContext);

  useDataLoader(() => {
    dispatch(fetchScenarioTeams(scenarioId));
  });

  const context: TeamContextType = {
    async onAddUsersTeam(teamId: Team['team_id'], userIds: UserStore['user_id'][]): Promise<void> {
      await dispatch(addScenarioTeamPlayers(scenarioId, teamId, { scenario_team_players: userIds }));
      return dispatch(fetchTeams());
    },
    async onRemoveUsersTeam(teamId: Team['team_id'], userIds: UserStore['user_id'][]): Promise<void> {
      await dispatch(removeScenarioTeamPlayers(scenarioId, teamId, { scenario_team_players: userIds }));
      return dispatch(fetchTeams());
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
    onToggleUser(teamId: Team['team_id'], userId: UserStore['user_id'], userEnabled: boolean): void {
      if (userEnabled) {
        dispatch(disableScenarioTeamPlayers(scenarioId, teamId, { scenario_team_players: [userId] }));
      } else {
        dispatch(enableScenarioTeamPlayers(scenarioId, teamId, { scenario_team_players: [userId] }));
      }
    },
  };

  const teamIds = teams.map((t) => t.team_id);

  const onAddTeams = (ids: Team['team_id'][]) => dispatch(addScenarioTeams(scenarioId, { scenario_teams: ids }));

  return (
    <TeamContext.Provider value={context}>
      <div className={classes.container}>
        <DefinitionMenu base="/admin/scenarios" id={scenarioId} />
        <Teams teamIds={teamIds} />
        {permissions.canWrite && <AddTeams addedTeamIds={teamIds} onAddTeams={onAddTeams} />}
      </div>
    </TeamContext.Provider>
  );
};

export default ScenarioTeams;
