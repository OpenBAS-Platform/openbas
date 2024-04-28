import React from 'react';
import { useParams } from 'react-router-dom';
import DefinitionMenu from '../../components/DefinitionMenu';
import { useAppDispatch } from '../../../../utils/hooks';
import type { Exercise } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import Challenges from '../../components/challenges/Challenges';
import { fetchExerciseChallenges } from '../../../../actions/Challenge';
import type { ChallengesHelper } from '../../../../actions/helper';
import { ChallengeContext, ChallengeContextType } from '../../components/Context';

const ExerciseChallenges = () => {
  // Standard hooks
  const dispatch = useAppDispatch();

  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const challenges = useHelper((helper: ChallengesHelper) => helper.getExerciseChallenges(exerciseId));
  useDataLoader(() => {
    dispatch(fetchExerciseChallenges(exerciseId));
  });

  const context: ChallengeContextType = {
    previewChallengeUrl: () => `/challenges/${exerciseId}?preview=true`,
  };

  return (
    <ChallengeContext.Provider value={context}>
      <DefinitionMenu base="/admin/exercises" id={exerciseId} />
      <Challenges challenges={challenges} />
    </ChallengeContext.Provider>
  );
};

export default ExerciseChallenges;
