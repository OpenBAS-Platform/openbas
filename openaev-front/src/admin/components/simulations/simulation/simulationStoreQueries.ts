import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';

import { fetchSimulationAssetGroups } from '../../../../actions/asset_groups/assetgroup-action';
import { fetchSimulationEndpoints } from '../../../../actions/assets/endpoint-actions';
import { fetchExerciseChallenges } from '../../../../actions/challenge-action';
import { fetchExerciseArticles } from '../../../../actions/channels/article-action';
import { fetchSimulationChannels } from '../../../../actions/channels/channel-action';
import { fetchExerciseCommunications } from '../../../../actions/Communication';
import { fetchExerciseDocuments } from '../../../../actions/documents/documents-actions';
import { fetchExerciseInjectExpectations, fetchExerciseTeams } from '../../../../actions/Exercise';
import {
  fetchLessonsAnswers,
  fetchLessonsCategories,
  fetchLessonsQuestions,
  fetchPlayersByExercise,
} from '../../../../actions/exercises/exercise-action';
import { fetchExerciseInjects, fetchExerciseInjectsSimple, reconcileExerciseInjects } from '../../../../actions/Inject';
import { fetchLogs } from '../../../../actions/Log';
import { fetchExerciseObjectives } from '../../../../actions/Objective';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import { fetchPlayers } from '../../../../actions/users/User';
import { fetchVariablesForExercise } from '../../../../actions/variables/variable-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { simulationKey } from '../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../utils/utils';

// Simulation data kept in the Redux store and read by shared components through useHelper.
// Each dataset is one store query under the simulation key: the topic 'simulation:<id>' refetches
// it, and every component reading the store follows.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dispatch = (action: any) => Promise<unknown>;

const LOADERS = {
  // Full injects (timeline, mails, validation, lessons, distributions).
  'injects': (dispatch: Dispatch, simulationId: string) => dispatch(fetchExerciseInjects(simulationId)),
  // Lightweight injects (header counters). Also evicts from the store the injects deleted
  // server-side (stop or reset of a chained simulation), which a refetch alone cannot do.
  'injects-simple': (dispatch: Dispatch, simulationId: string) => dispatch(reconcileExerciseInjects(simulationId, fetchExerciseInjectsSimple)),
  'expectations': (dispatch: Dispatch, simulationId: string) => dispatch(fetchExerciseInjectExpectations(simulationId)),
  'teams': (dispatch: Dispatch, simulationId: string) => dispatch(fetchExerciseTeams(simulationId)),
  'articles': (dispatch: Dispatch, simulationId: string) => dispatch(fetchExerciseArticles(simulationId)),
  'challenges': (dispatch: Dispatch, simulationId: string) => dispatch(fetchExerciseChallenges(simulationId)),
  'variables': (dispatch: Dispatch, simulationId: string) => dispatch(fetchVariablesForExercise(simulationId)),
  'documents': (dispatch: Dispatch, simulationId: string) => dispatch(fetchExerciseDocuments(simulationId)),
  'channels': (dispatch: Dispatch, simulationId: string) => dispatch(fetchSimulationChannels(simulationId)),
  'players': (dispatch: Dispatch, simulationId: string) => dispatch(fetchPlayersByExercise(simulationId)),
  'objectives': (dispatch: Dispatch, simulationId: string) => dispatch(fetchExerciseObjectives(simulationId)),
  'lessons-categories': (dispatch: Dispatch, simulationId: string) => dispatch(fetchLessonsCategories(simulationId)),
  'lessons-questions': (dispatch: Dispatch, simulationId: string) => dispatch(fetchLessonsQuestions(simulationId)),
  'lessons-answers': (dispatch: Dispatch, simulationId: string) => dispatch(fetchLessonsAnswers(simulationId)),
  'communications': (dispatch: Dispatch, simulationId: string) => dispatch(fetchExerciseCommunications(simulationId)),
  'logs': (dispatch: Dispatch, simulationId: string) => dispatch(fetchLogs(simulationId)),
  'endpoints': (dispatch: Dispatch, simulationId: string) => dispatch(fetchSimulationEndpoints(simulationId)),
  'asset-groups': (dispatch: Dispatch, simulationId: string) => dispatch(fetchSimulationAssetGroups(simulationId)),
  // Every team and player of the platform (names resolved by mails, lessons and validation),
  // refreshed with the simulation.
  'all-teams': (dispatch: Dispatch) => dispatch(fetchTeams()),
  'all-players': (dispatch: Dispatch) => dispatch(fetchPlayers()),
} as const;

export type SimulationStoreDataset = keyof typeof LOADERS;

export const simulationStoreKey = (simulationId: string, dataset: SimulationStoreDataset) => [...simulationKey(simulationId), dataset] as const;

// The store dispatch is stable, so it is left out of the key.
// eslint-disable-next-line @tanstack/query/exhaustive-deps
const storeQueryOptions = (dispatch: Dispatch, simulationId: string, dataset: SimulationStoreDataset, refetchInterval: number | false) => ({
  queryKey: simulationStoreKey(simulationId, dataset),
  queryFn: () => LOADERS[dataset](dispatch, simulationId).then(() => null),
  // Fetch actions show their own error toast: no retry, so one toast only.
  retry: false,
  refetchInterval,
});

interface Options {
  // Fallback refetch interval, for data that changes while the simulation runs and that no
  // invalidation announces.
  refetchInterval?: number | false;
}

/**
 * Loads simulation datasets into the Redux store.
 *
 * With live updates on, each dataset is a store query (see useStoreQuery) under
 * [...simulationKey(id), dataset], so a stream invalidation reloads it, and two components
 * loading the same dataset (the header and a tab) share one request. With live updates off, the
 * datasets load through useDataLoader, as before.
 */
const useSimulationStoreData = (simulationId: string, datasets: SimulationStoreDataset[], { refetchInterval = false }: Options = {}) => {
  const dispatch: Dispatch = useAppDispatch();
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  const results = useQueries({ queries: liveUpdates ? datasets.map(dataset => storeQueryOptions(dispatch, simulationId, dataset, refetchInterval)) : [] });

  const [legacyPending, setLegacyPending] = useState(!liveUpdates);
  useDataLoader(() => {
    if (!liveUpdates) {
      Promise.allSettled(datasets.map(dataset => LOADERS[dataset](dispatch, simulationId)))
        .then(() => setLegacyPending(false));
    }
  });

  if (!liveUpdates) {
    return {
      isPending: legacyPending,
      isFetching: legacyPending,
    };
  }
  return {
    isPending: results.some(result => result.isPending),
    isFetching: results.some(result => result.isFetching),
  };
};

export default useSimulationStoreData;
