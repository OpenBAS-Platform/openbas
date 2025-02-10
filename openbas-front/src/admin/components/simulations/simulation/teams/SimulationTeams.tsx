import { Paper, Typography } from '@mui/material';
import * as React from 'react';
import { useContext } from 'react';
import { useParams } from 'react-router';

import { fetchExerciseTeams } from '../../../../../actions/Exercise';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import { useFormatter } from '../../../../../components/i18n';
import { useHelper } from '../../../../../store';
import type { Exercise, Team } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { PermissionsContext, TeamContext } from '../../../common/Context';
import ContextualTeams from '../../../components/teams/ContextualTeams';
import UpdateTeams from '../../../components/teams/UpdateTeams';
import teamContextForExercise from './teamContextForExercise';

interface Props {
  exerciseTeamsUsers: Exercise['exercise_teams_users'];
}

const SimulationTeams: React.FC<Props> = ({ exerciseTeamsUsers }) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { permissions } = useContext(PermissionsContext);

  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const { teamsStore }: { teamsStore: Team[] } = useHelper((helper: ExercisesHelper) => ({
    teamsStore: helper.getExerciseTeams(exerciseId),
  }));
  useDataLoader(() => {
    dispatch(fetchExerciseTeams(exerciseId));
  });

  return (
    <TeamContext.Provider value={teamContextForExercise(exerciseId, exerciseTeamsUsers)}>
      <div>
        <Typography variant="h4">
          {t('Teams')}
          {permissions.canWrite
          && (
            <UpdateTeams
              addedTeamIds={teamsStore.map((team: Team) => team.team_id)}
            />
          )}
        </Typography>
        <div className="clearfix" />
        <Paper sx={{ minHeight: '100%', padding: 2 }} variant="outlined">
          <ContextualTeams teams={teamsStore} />
        </Paper>
      </div>
    </TeamContext.Provider>
  );
};

export default SimulationTeams;
