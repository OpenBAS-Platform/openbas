import { useParams } from 'react-router-dom';
import React, { useContext } from 'react';
import { Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../../../../utils/hooks';
import { PermissionsContext, TeamContext } from '../../../common/Context';
import type { UserStore } from '../../../teams/players/Player';
import AddTeams from '../../../components/teams/AddTeams';
import type { SearchPaginationInput, Team, TeamCreateInput, TeamOutput } from '../../../../../utils/api-types';
import type { TeamStore } from '../../../../../actions/teams/Team';
import {
  addExerciseTeamPlayers,
  addExerciseTeams,
  disableExerciseTeamPlayers,
  enableExerciseTeamPlayers,
  fetchExerciseTeams,
  removeExerciseTeamPlayers,
  removeExerciseTeams,
} from '../../../../../actions/Exercise';
import { addTeam, fetchTeams } from '../../../../../actions/teams/team-actions';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import ContextualTeams from '../../../components/teams/ContextualTeams';
import { useFormatter } from '../../../../../components/i18n';
import type { Page } from '../../../../../components/common/queryable/Page';
import { searchExerciseTeams } from '../../../../../actions/exercises/exercise-teams-action';

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
  exerciseTeamsUsers: ExerciseStore['exercise_teams_users'],
}

export const teamContextForExercise = (exerciseId: ExerciseStore['exercise_id'], exerciseTeamsUsers: ExerciseStore['exercise_teams_users']) => {
  const dispatch = useAppDispatch();

  return {
    async onAddUsersTeam(teamId: Team['team_id'], userIds: UserStore['user_id'][]): Promise<void> {
      await dispatch(addExerciseTeamPlayers(exerciseId, teamId, { exercise_team_players: userIds }));
      return dispatch(fetchTeams());
    },
    async onRemoveUsersTeam(teamId: Team['team_id'], userIds: UserStore['user_id'][]): Promise<void> {
      await dispatch(removeExerciseTeamPlayers(exerciseId, teamId, { exercise_team_players: userIds }));
      return dispatch(fetchTeams());
    },
    onAddTeam(teamId: Team['team_id']): Promise<void> {
      return dispatch(addExerciseTeams(exerciseId, { exercise_teams: [teamId] }));
    },
    onCreateTeam(team: TeamCreateInput): Promise<{ result: string }> {
      return dispatch(addTeam({ ...team, team_exercises: [exerciseId] }));
    },
    checkUserEnabled(teamId: Team['team_id'], userId: UserStore['user_id']): boolean {
      return exerciseTeamsUsers.filter((o: ExerciseStore['exercise_teams_users']) => o.exercise_id === exerciseId && o.team_id === teamId && userId === o.user_id).length > 0;
    },
    computeTeamUsersEnabled(teamId: Team['team_id']) {
      return exerciseTeamsUsers.filter((o: ExerciseStore['exercise_teams_users']) => o.team_id === teamId).length;
    },
    onRemoveTeam(teamId: Team['team_id']): void {
      dispatch(removeExerciseTeams(exerciseId, { exercise_teams: [teamId] }));
    },
    onToggleUser(teamId: Team['team_id'], userId: UserStore['user_id'], userEnabled: boolean): void {
      if (userEnabled) {
        dispatch(disableExerciseTeamPlayers(exerciseId, teamId, { exercise_team_players: [userId] }));
      } else {
        dispatch(enableExerciseTeamPlayers(exerciseId, teamId, { exercise_team_players: [userId] }));
      }
    },
    searchTeams(input: SearchPaginationInput): Promise<{ data: Page<TeamOutput> }> {
      return searchExerciseTeams(exerciseId, input);
    },
  };
};

const ExerciseTeams: React.FC<Props> = ({ exerciseTeamsUsers }) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { exerciseId } = useParams() as { exerciseId: ExerciseStore['exercise_id'] };
  const { teams }: { exercise: ExerciseStore, teams: TeamStore[] } = useHelper((helper: ExercisesHelper) => ({
    teams: helper.getExerciseTeams(exerciseId),
  }));
  const { permissions } = useContext(PermissionsContext);
  useDataLoader(() => {
    dispatch(fetchExerciseTeams(exerciseId));
  });
  const teamIds = teams.map((team) => team.team_id);
  const onAddTeams = (ids: Team['team_id'][]) => {
    return dispatch(addExerciseTeams(exerciseId, { exercise_teams: ids }));
  };
  return (
    <TeamContext.Provider value={teamContextForExercise(exerciseId, exerciseTeamsUsers)}>
      <Typography variant="h4" gutterBottom style={{ float: 'left' }}>
        {t('Teams')}
      </Typography>
      {permissions.canWrite && <AddTeams addedTeamIds={teamIds} onAddTeams={onAddTeams} />}
      <div className="clearfix" />
      <Paper classes={{ root: classes.paper }} variant="outlined">
        <ContextualTeams teamIds={teamIds} />
      </Paper>
    </TeamContext.Provider>
  );
};

export default ExerciseTeams;
