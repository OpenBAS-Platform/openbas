import { useQueries } from '@tanstack/react-query';

import { fetchScenarioChallenges } from '../../../../actions/challenge-action';
import { fetchScenarioArticles } from '../../../../actions/channels/article-action';
import { fetchScenarioChannels } from '../../../../actions/channels/channel-action';
import { fetchScenarioDocuments } from '../../../../actions/documents/documents-actions';
import { fetchScenarioObjectives } from '../../../../actions/Objective';
import { fetchLessonsCategories, fetchLessonsQuestions, fetchPlayersByScenario, fetchScenarioTeams } from '../../../../actions/scenarios/scenario-actions';
import { fetchScenarioInjectsSimple } from '../../../../actions/scenarios/scenario-inject-actions';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import { fetchVariablesForScenario } from '../../../../actions/variables/variable-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { scenarioKey } from '../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../utils/utils';

// Scenario data kept in the Redux store and read by shared components through useHelper.
// Each dataset is one store query under the scenario key: the topic 'scenario:<id>' refetches it,
// and every component reading the store follows.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dispatch = (action: any) => Promise<unknown>;

const LOADERS = {
  'injects': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchScenarioInjectsSimple(scenarioId)),
  'teams': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchScenarioTeams(scenarioId)),
  'articles': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchScenarioArticles(scenarioId)),
  'challenges': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchScenarioChallenges(scenarioId)),
  'variables': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchVariablesForScenario(scenarioId)),
  'documents': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchScenarioDocuments(scenarioId)),
  'channels': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchScenarioChannels(scenarioId)),
  'players': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchPlayersByScenario(scenarioId)),
  'objectives': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchScenarioObjectives(scenarioId)),
  'lessons-categories': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchLessonsCategories(scenarioId)),
  'lessons-questions': (dispatch: Dispatch, scenarioId: string) => dispatch(fetchLessonsQuestions(scenarioId)),
  // Every team of the platform (lessons resolve team names from it), refreshed with the scenario.
  'all-teams': (dispatch: Dispatch) => dispatch(fetchTeams()),
} as const;

export type ScenarioStoreDataset = keyof typeof LOADERS;

export const scenarioStoreKey = (scenarioId: string, dataset: ScenarioStoreDataset) => [...scenarioKey(scenarioId), dataset] as const;

// The store dispatch is stable, so it is left out of the key.
// eslint-disable-next-line @tanstack/query/exhaustive-deps
const storeQueryOptions = (dispatch: Dispatch, scenarioId: string, dataset: ScenarioStoreDataset) => ({
  queryKey: scenarioStoreKey(scenarioId, dataset),
  queryFn: () => LOADERS[dataset](dispatch, scenarioId).then(() => null),
  // Fetch actions show their own error toast: no retry, so one toast only.
  retry: false,
});

/**
 * Loads scenario datasets into the Redux store.
 *
 * With live updates on, each dataset is a store query (see useStoreQuery) under
 * [...scenarioKey(id), dataset], so a stream invalidation reloads it, and two screens loading the
 * same dataset share one request. With live updates off, the datasets load through useDataLoader,
 * as before.
 */
const useScenarioStoreData = (scenarioId: string, datasets: ScenarioStoreDataset[]) => {
  const dispatch: Dispatch = useAppDispatch();
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  useQueries({ queries: liveUpdates ? datasets.map(dataset => storeQueryOptions(dispatch, scenarioId, dataset)) : [] });

  useDataLoader(() => {
    if (!liveUpdates) {
      datasets.forEach(dataset => LOADERS[dataset](dispatch, scenarioId));
    }
  });
};

export default useScenarioStoreData;
