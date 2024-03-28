import { useParams } from 'react-router-dom';
import React, { useContext } from 'react';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../utils/hooks';
import DefinitionMenu from '../../components/DefinitionMenu';
import Teams from '../../components/teams/Teams';
import { PermissionsContext, TeamContext } from '../../components/Context';
import type { UserStore } from '../../teams/players/Player';
import AddTeams from '../../components/teams/AddTeams';
import type { Team, TeamCreateInput } from '../../../../utils/api-types';
import type { TeamStore } from '../../../../actions/teams/Team';
import {
  addExerciseTeamPlayers,
  addExerciseTeams,
  disableExerciseTeamPlayers,
  enableExerciseTeamPlayers,
  fetchExerciseTeams,
  removeExerciseTeamPlayers,
  removeExerciseTeams,
} from '../../../../actions/Exercise';
import { addTeam, fetchTeams } from '../../../../actions/teams/team-actions';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';

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
  };
};

const ExerciseTeams: React.FC<Props> = ({ exerciseTeamsUsers }) => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { exerciseId } = useParams() as { exerciseId: ExerciseStore['exercise_id'] };

  const { teams }: { exercise: ExerciseStore, teams: TeamStore[] } = useHelper((helper: ExercisesHelper) => ({
    teams: helper.getExerciseTeams(exerciseId),
  }));

  const { permissions } = useContext(PermissionsContext);

  useDataLoader(() => {
    dispatch(fetchExerciseTeams(exerciseId));
  });

  const teamIds = teams.map((t) => t.team_id);

  const onAddTeams = (ids: Team['team_id'][]) => {
    return dispatch(addExerciseTeams(exerciseId, { exercise_teams: ids }));
  };

  return (
    <TeamContext.Provider value={teamContextForExercise(exerciseId, exerciseTeamsUsers)}>
      <DefinitionMenu base="/admin/exercises" id={exerciseId} />
      <Teams teamIds={teamIds} contextual={true} />
      {permissions.canWrite && <AddTeams addedTeamIds={teamIds} onAddTeams={onAddTeams} />}
    </TeamContext.Provider>
  );
};

export default ExerciseTeams;
