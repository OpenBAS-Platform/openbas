import { useQueryClient } from '@tanstack/react-query';
import { type FunctionComponent, Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { fetchInjectResultOverviewOutput } from '../../../../../actions/atomic_testings/atomic-testing-actions';
import { fetchExercise } from '../../../../../actions/Exercise';
import { type ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import Loader from '../../../../../components/Loader';
import NotFound from '../../../../../components/NotFound';
import { useHelper } from '../../../../../store';
import { type Exercise as ExerciseType, type InjectResultOverviewOutput } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { INHERITED_CONTEXT } from '../../../../../utils/permissions/types';
import useSimulationPermissions from '../../../../../utils/permissions/useSimulationPermissions';
import { atomicTestingKey, simulationKey } from '../../../../../utils/query/keys';
import { isClientError, retryUnlessClientError } from '../../../../../utils/query/queryErrors';
import useNotifiedQuery, { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../../utils/query/useNotifiedQuery';
import useStoreQuery from '../../../../../utils/query/useStoreQuery';
import { isFeatureEnabled } from '../../../../../utils/utils';
import AtomicTestingRoutes from '../../../atomic_testings/atomic_testing/AtomicTestingRoutes';
import { InjectResultOverviewOutputContext } from '../../../atomic_testings/InjectResultOverviewOutputContext';
import { PermissionsContext, type PermissionsContextType } from '../../../common/Context';
import { simulationEntityKey } from '../simulationQueries';
import InjectIndexHeader from './InjectIndexHeader';

// Every query of one inject screen of a simulation starts with this key, so the topic
// 'simulation:<id>' (sent on any change of the simulation's injects, statuses and expectations)
// refetches it.
const simulationInjectKey = (simulationId: string, injectId: string) => [...simulationKey(simulationId), 'inject', injectId] as const;
const simulationInjectOverviewKey = (simulationId: string, injectId: string) => [...simulationInjectKey(simulationId, injectId), 'overview'] as const;

const InjectIndexComponent: FunctionComponent<{
  exercise: ExerciseType;
  injectResultOverviewOutput: InjectResultOverviewOutput;
  updateInjectResultOverviewOutput: (newData: InjectResultOverviewOutput) => void;
}> = ({
  exercise,
  injectResultOverviewOutput,
  updateInjectResultOverviewOutput,
}) => {
  const permissionsContext: PermissionsContextType = {
    permissions: useSimulationPermissions(exercise.exercise_id, exercise),
    inherited_context: INHERITED_CONTEXT.SIMULATION,
  };

  return (
    <InjectResultOverviewOutputContext.Provider value={{
      injectResultOverviewOutput,
      updateInjectResultOverviewOutput,
    }}
    >
      <PermissionsContext.Provider value={permissionsContext}>
        <InjectIndexHeader injectResultOverview={injectResultOverviewOutput} exercise={exercise} />
        <Suspense fallback={<Loader />}>
          <AtomicTestingRoutes injectResultOverview={injectResultOverviewOutput} />
        </Suspense>
      </PermissionsContext.Provider>
    </InjectResultOverviewOutputContext.Provider>
  );
};

interface Props {
  exerciseId: ExerciseType['exercise_id'];
  injectId: InjectResultOverviewOutput['inject_id'];
  exercise?: ExerciseType;
}

// Loads the overview once per inject.
const LoadedInjectIndex = ({ injectId, exercise }: Omit<Props, 'exerciseId'>) => {
  const [injectResultOutput, setInjectResultOverviewOutput] = useState<InjectResultOverviewOutput>();
  const [loadingInject, setLoadingInject] = useState(true);

  useEffect(() => {
    setLoadingInject(true);
    fetchInjectResultOverviewOutput(injectId)
      .then((result: { data: InjectResultOverviewOutput }) => {
        setInjectResultOverviewOutput(result.data);
      })
      // 404 (deleted inject - e.g. its injector contract or phishing landing page was removed)
      // or 403 masked as 404: swallow the rejection, the render below decides what to show.
      .catch(() => setInjectResultOverviewOutput(undefined))
      .finally(() => setLoadingInject(false));
  }, [injectId]);

  if (loadingInject) {
    return <Loader />;
  }

  // The fetch completed without a result: the inject does not exist (anymore) or is not
  // accessible. Render a proper not-found instead of the previous infinite loader (#4844).
  if (!injectResultOutput) {
    return <NotFound />;
  }

  if (exercise) {
    return <InjectIndexComponent exercise={exercise} injectResultOverviewOutput={injectResultOutput} updateInjectResultOverviewOutput={setInjectResultOverviewOutput} />;
  }
  return <Loader />;
};

// Live updates: the overview is a query under the simulation key. The tabs below it (targets,
// findings, ...) are the atomic testing ones, whose queries start with the atomic testing key; the
// stream sends no 'atomic-testing:<id>' topic for a simulation inject, so each overview refetch
// also refetches them.
const QueriedInjectIndex = ({ exerciseId, injectId, exercise }: Props) => {
  const queryClient = useQueryClient();
  const overviewKey = simulationInjectOverviewKey(exerciseId, injectId);
  const refreshInjectTabs = () => queryClient.invalidateQueries({ queryKey: atomicTestingKey(injectId) });
  const { data, error, isPending } = useNotifiedQuery({
    queryKey: overviewKey,
    queryFn: async ({ queryKey }) => {
      const refetch = queryClient.getQueryData(queryKey) !== undefined;
      // The error toast is shown once by useNotifiedQuery, after the library's retries.
      const result: { data: InjectResultOverviewOutput } = await fetchInjectResultOverviewOutput(injectId, false);
      if (refetch) {
        refreshInjectTabs();
      }
      return result.data;
    },
    retry: retryUnlessClientError,
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
  });

  // Callers pass the overview the server returned after a change: it replaces the cached one, and
  // the tabs refetch.
  const applyInjectResultOverviewOutput = (newData: InjectResultOverviewOutput) => {
    queryClient.setQueryData(overviewKey, newData);
    refreshInjectTabs();
  };

  if (isPending) {
    return <Loader />;
  }

  // Deleted or not accessible, on the first load or while on screen.
  if (isClientError(error) || !data) {
    return <NotFound />;
  }

  if (exercise) {
    return <InjectIndexComponent exercise={exercise} injectResultOverviewOutput={data} updateInjectResultOverviewOutput={applyInjectResultOverviewOutput} />;
  }
  return <Loader />;
};

const InjectIndex = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: ExerciseType['exercise_id'] };
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };
  const exercise = useHelper((helper: ExercisesHelper) => helper.getExercise(exerciseId));
  // Constant for a session: the screen keeps one of the two paths.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  useStoreQuery(simulationEntityKey(exerciseId), () => dispatch(fetchExercise(exerciseId)), { enabled: liveUpdates });
  // The data loader also keeps the legacy stream open; with live updates on, it loads nothing itself.
  useDataLoader(() => {
    if (!liveUpdates) {
      dispatch(fetchExercise(exerciseId));
    }
  });

  return liveUpdates
    ? <QueriedInjectIndex exerciseId={exerciseId} injectId={injectId} exercise={exercise} />
    : <LoadedInjectIndex injectId={injectId} exercise={exercise} />;
};

export default InjectIndex;
