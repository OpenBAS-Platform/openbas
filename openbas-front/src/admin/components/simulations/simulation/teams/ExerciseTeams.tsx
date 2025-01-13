import { Paper, Typography } from '@mui/material';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
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

const ExerciseTeams: React.FC<Props> = ({ exerciseTeamsUsers }) => {
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

  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    setTeams(teamsStore);
  }, [teamsStore]);

  return (
    <TeamContext.Provider value={teamContextForExercise(exerciseId, exerciseTeamsUsers)}>
      <Typography variant="h4" gutterBottom style={{ float: 'left' }}>
        {t('Teams')}
      </Typography>
      {permissions.canWrite
      && (
        <UpdateTeams
          addedTeamIds={teams.map((team: Team) => team.team_id)}
          setTeams={(ts: Team[]) => setTeams(ts)}
        />
      )}
      <div className="clearfix" />
      <Paper sx={{ minHeight: '100%', padding: 2 }} variant="outlined">
        <ContextualTeams teams={teams} />
      </Paper>
    </TeamContext.Provider>
  );
};

export default ExerciseTeams;
