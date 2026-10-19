import { useEffect } from 'react';
import { useParams } from 'react-router';

import { fetchMe } from '../../../../../actions/Application';
import { fetchSimulationObserverChallenges } from '../../../../../actions/challenge-action';
import { fetchSimulationPlayerDocuments } from '../../../../../actions/Document';
import { fetchExercise } from '../../../../../actions/Exercise';
import { type ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import { type SimulationChallengesReaderHelper } from '../../../../../actions/helper';
import { useHelper } from '../../../../../store';
import { type Exercise as ExerciseType, type SimulationChallengesReader } from '../../../../../utils/api-types';
import { useQueryParameter } from '../../../../../utils/Environment';
import { useAppDispatch } from '../../../../../utils/hooks';
import useSimulationPermissions from '../../../../../utils/permissions/useSimulationPermissions';
import { simulationKey } from '../../../../../utils/query/keys';
import useStoreQuery from '../../../../../utils/query/useStoreQuery';
import { isFeatureEnabled } from '../../../../../utils/utils';
import ChallengesPreview from '../../../common/challenges/ChallengesPreview';
import { PreviewChallengeContext } from '../../../common/Context';

const SimulationChallengesPreview = () => {
  const dispatch = useAppDispatch();
  const { exerciseId } = useParams() as { exerciseId: ExerciseType['exercise_id'] };
  const { challengesReader, fullExercise }: {
    fullExercise: ExerciseType;
    challengesReader: SimulationChallengesReader;
  } = useHelper((helper: SimulationChallengesReaderHelper & ExercisesHelper) => ({
    fullExercise: helper.getExercise(exerciseId),
    challengesReader: helper.getSimulationChallengesReader(exerciseId),
  }));
  const { exercise_information: exercise, exercise_challenges: challenges } = challengesReader ?? {};
  const permissions = useSimulationPermissions(exerciseId, fullExercise);
  const [userId, challengeId] = useQueryParameter(['user', 'challenge']);

  // With live updates on, the simulation data of the preview is a store query under the simulation key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  useStoreQuery(
    [...simulationKey(exerciseId), 'challenges-preview', userId],
    () => Promise.all([
      dispatch(fetchExercise(exerciseId)),
      dispatch(fetchSimulationObserverChallenges(exerciseId, userId)),
      dispatch(fetchSimulationPlayerDocuments(exerciseId, userId)),
    ]),
    { enabled: liveUpdates && !!exerciseId },
  );

  useEffect(() => {
    dispatch(fetchMe());
    if (exerciseId && !liveUpdates) {
      dispatch(fetchExercise(exerciseId));
      dispatch(fetchSimulationObserverChallenges(exerciseId, userId));
      dispatch(fetchSimulationPlayerDocuments(exerciseId, userId));
    }
  }, [dispatch, exerciseId, userId]);

  return (
    <PreviewChallengeContext.Provider value={{
      linkToPlayerMode: `/challenges/${exerciseId}?challenge=${challengeId}&user=${userId}`,
      linkToAdministrationMode: `/admin/simulations/${exerciseId}/injects`,
      scenarioOrExercise: exercise,
    }}
    >
      <ChallengesPreview challenges={challenges} permissions={permissions} />
    </PreviewChallengeContext.Provider>
  );
};

export default SimulationChallengesPreview;
