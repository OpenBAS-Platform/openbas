import { Paper, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { fetchExerciseTeams } from '../../../../../actions/Exercise';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import type { TeamStore } from '../../../../../actions/teams/Team';
import { useFormatter } from '../../../../../components/i18n';
import { useHelper } from '../../../../../store';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { PermissionsContext, TeamContext } from '../../../common/Context';
import ContextualTeams from '../../../components/teams/ContextualTeams';
import UpdateTeams from '../../../components/teams/UpdateTeams';
import teamContextForExercise from './teamContextForExercise';

interface Props {
  exerciseTeamsUsers: ExerciseStore['exercise_teams_users'];
}

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
      && (
        <UpdateTeams
          addedTeamIds={teams.map((team: TeamStore) => team.team_id)}
          setTeams={(ts: TeamStore[]) => setTeams(ts)}
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
