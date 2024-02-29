import { useParams } from 'react-router-dom';
import React, { useContext } from 'react';
import { makeStyles } from '@mui/styles';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../utils/hooks';
import DefinitionMenu from '../../components/DefinitionMenu';
import Teams from '../../components/teams/Teams';
import { PermissionsContext, TeamContext, TeamContextType } from '../../components/Context';
import type { UserStore } from '../../teams/players/Player';
import AddTeams from '../../components/teams/AddTeams';
import type { Team, TeamCreateInput } from '../../../../utils/api-types';
import type { TeamStore } from '../../../../actions/teams/Team';
import { addExerciseTeamPlayers, addExerciseTeams, fetchExerciseTeams, removeExerciseTeamPlayers, removeExerciseTeams } from '../../../../actions/Exercise';
import { addTeam } from '../../../../actions/teams/team-actions';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

interface Props {
  exerciseTeamsUsers: ExerciseStore['exercise_teams_users'],
}

const ExerciseTeams: React.FC<Props> = ({ exerciseTeamsUsers }) => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { exerciseId } = useParams() as { exerciseId: ExerciseStore['exercise_id'] };

  const { teams }: { exercise: ExerciseStore, teams: TeamStore[] } = useHelper((helper: ExercisesHelper) => ({
    teams: helper.getExerciseTeams(exerciseId),
  }));

  const { permissions } = useContext(PermissionsContext);

  useDataLoader(() => {
    dispatch(fetchExerciseTeams(exerciseId));
  });

  const context: TeamContextType = {
    onCreateTeam(team: TeamCreateInput): Promise<{ result: string }> {
      return dispatch(addTeam({ ...team, team_exercises: [exerciseId] }));
    },
    checkUserEnabled(teamId: Team['team_id'], userId: UserStore['user_id']): boolean {
      return exerciseTeamsUsers.filter((o: ExerciseStore['exercise_teams_users']) => o.exercise_id === exerciseId && o.team_id === teamId && userId === o.user_id).length > 0;
    },
    computeTeamUsersEnabled(teamId: Team['team_id']) {
      return exerciseTeamsUsers.filter((o: ExerciseStore['exercise_teams_users']) => o.team_id === teamId).length;
    },
    onAddTeams(teamIds: Team['team_id'][]): void {
      dispatch(addExerciseTeams(exerciseId, { exercise_teams: teamIds }));
    },
    onRemoveTeam(teamId: Team['team_id']): void {
      dispatch(removeExerciseTeams(exerciseId, { exercise_teams: [teamId] }));
    },
    onToggleUser(teamId: Team['team_id'], userId: UserStore['user_id'], userEnabled: boolean): void {
      if (userEnabled) {
        dispatch(removeExerciseTeamPlayers(exerciseId, teamId, { exercise_team_players: [userId] }));
      } else {
        dispatch(addExerciseTeamPlayers(exerciseId, teamId, { exercise_team_players: [userId] }));
      }
    },
  };

  const teamIds = teams.map((t) => t.team_id);

  return (
    <TeamContext.Provider value={context}>
      <div className={classes.container}>
        <DefinitionMenu base="/admin/exercises" id={exerciseId} />
        <Teams teamIds={teamIds} />
        {permissions.canWrite && <AddTeams addedTeamIds={teamIds} />}
      </div>
    </TeamContext.Provider>
  );
};

export default ExerciseTeams;
