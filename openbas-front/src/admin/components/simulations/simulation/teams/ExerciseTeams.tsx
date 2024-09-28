import { useParams } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../../../../utils/hooks';
import { PermissionsContext, TeamContext, TeamContextType } from '../../../common/Context';
import type { UserStore } from '../../../teams/players/Player';
import UpdateTeams from '../../../components/teams/UpdateTeams';
import type { SearchPaginationInput, Team, TeamCreateInput, TeamOutput } from '../../../../../utils/api-types';
import type { TeamStore } from '../../../../../actions/teams/Team';
import { addExerciseTeamPlayers, disableExerciseTeamPlayers, enableExerciseTeamPlayers, fetchExerciseTeams, removeExerciseTeamPlayers } from '../../../../../actions/Exercise';
import { addTeam, fetchTeams } from '../../../../../actions/teams/team-actions';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import ContextualTeams from '../../../components/teams/ContextualTeams';
import { useFormatter } from '../../../../../components/i18n';
import type { Page } from '../../../../../components/common/queryable/Page';
import { searchExerciseTeams, addExerciseTeams, removeExerciseTeams, replaceExerciseTeams } from '../../../../../actions/exercises/exercise-teams-action';

interface Props {
  exerciseTeamsUsers: ExerciseStore['exercise_teams_users'],
}

export const teamContextForExercise = (exerciseId: ExerciseStore['exercise_id'], exerciseTeamsUsers: ExerciseStore['exercise_teams_users']): TeamContextType => {
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
    onReplaceTeam(teamIds: Team['team_id'][]): Promise<{ result: string[], entities: { teams: Record<string, TeamStore> } }> {
      return dispatch(replaceExerciseTeams(exerciseId, { exercise_teams: teamIds }));
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
  const dispatch = useAppDispatch();
  const { permissions } = useContext(PermissionsContext);

  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: ExerciseStore['exercise_id'] };
  const { teamsStore }: { teamsStore: TeamStore[] } = useHelper((helper: ExercisesHelper) => ({
    teamsStore: helper.getExerciseTeams(exerciseId),
  }));
  useDataLoader(() => {
    dispatch(fetchExerciseTeams(exerciseId));
  });

  const [teams, setTeams] = useState<TeamStore[]>([]);
  useEffect(() => {
    setTeams(teamsStore);
  }, [teamsStore]);

  return (
    <TeamContext.Provider value={teamContextForExercise(exerciseId, exerciseTeamsUsers)}>
      <Typography variant="h4" gutterBottom style={{ float: 'left' }}>
        {t('Teams')}
      </Typography>
      {permissions.canWrite
        && <UpdateTeams
          addedTeamIds={teams.map((team: TeamStore) => team.team_id)}
          setTeams={(ts: TeamStore[]) => setTeams(ts)}
        />
      }
      <div className="clearfix" />
      <Paper sx={{ minHeight: '100%', padding: 2 }} variant="outlined">
        <ContextualTeams teams={teams} />
      </Paper>
    </TeamContext.Provider>
  );
};

export default ExerciseTeams;
