import { useParams } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../../../../utils/hooks';
import {
  addScenarioTeamPlayers,
  disableScenarioTeamPlayers,
  enableScenarioTeamPlayers,
  fetchScenarioTeams,
  removeScenarioTeamPlayers,
} from '../../../../../actions/scenarios/scenario-actions';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import type { TeamStore } from '../../../../../actions/teams/Team';
import { PermissionsContext, TeamContext } from '../../../common/Context';
import type { SearchPaginationInput, Team, TeamCreateInput, TeamOutput } from '../../../../../utils/api-types';
import { addTeam, fetchTeams } from '../../../../../actions/teams/team-actions';
import type { UserStore } from '../../../teams/players/Player';
import AddTeams from '../../../components/teams/AddTeams';
import { useFormatter } from '../../../../../components/i18n';
import ContextualTeams from '../../../components/teams/ContextualTeams';
import { addScenarioTeams, removeScenarioTeams, replaceScenarioTeams, searchScenarioTeams } from '../../../../../actions/scenarios/scenario-teams-action';
import type { Page } from '../../../../../components/common/queryable/Page';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '-4px 0 0 0',
    padding: 15,
    borderRadius: 4,
  },
}));

interface Props {
  scenarioTeamsUsers: ScenarioStore['scenario_teams_users'],
}

export const teamContextForScenario = (scenarioId: ScenarioStore['scenario_id'], scenarioTeamsUsers: ScenarioStore['scenario_teams_users']) => {
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
    onReplaceTeam(teamIds: Team['team_id'][]): Promise<{ result: string[] }> {
      return dispatch(replaceScenarioTeams(scenarioId, { scenario_teams: teamIds }));
    },
    onToggleUser(teamId: Team['team_id'], userId: UserStore['user_id'], userEnabled: boolean): void {
      if (userEnabled) {
        dispatch(disableScenarioTeamPlayers(scenarioId, teamId, { scenario_team_players: [userId] }));
      } else {
        dispatch(enableScenarioTeamPlayers(scenarioId, teamId, { scenario_team_players: [userId] }));
      }
    },
    searchTeams(input: SearchPaginationInput): Promise<{ data: Page<TeamOutput> }> {
      return searchScenarioTeams(scenarioId, input);
    },
  };
};

const ScenarioTeams: React.FC<Props> = ({ scenarioTeamsUsers }) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const { teams }: { scenario: ScenarioStore, teams: TeamStore[] } = useHelper((helper: ScenariosHelper) => ({
    teams: helper.getScenarioTeams(scenarioId),
  }));
  const { permissions } = useContext(PermissionsContext);
  useDataLoader(() => {
    dispatch(fetchScenarioTeams(scenarioId));
  });
  const [teamIds, setTeamsId] = useState<string[]>([]);

  useEffect(() => {
    setTeamsId(teams.map((team) => team.team_id));
  }, [teams]);
  return (
    <TeamContext.Provider value={teamContextForScenario(scenarioId, scenarioTeamsUsers)}>
      <Typography variant="h4" gutterBottom style={{ float: 'left' }}>
        {t('Teams')}
      </Typography>
      {permissions.canWrite && <AddTeams addedTeamIds={teamIds} setTeamIds={(ids: string[]) => setTeamsId(ids)}/>}
      <div className="clearfix" />
      <Paper classes={{ root: classes.paper }} variant="outlined">
        <ContextualTeams teamIds={teamIds} />
      </Paper>
    </TeamContext.Provider>
  );
};

export default ScenarioTeams;
