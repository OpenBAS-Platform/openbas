import { searchScenarioHealthcheks } from '../../../../actions/scenarios/scenario-actions';
import { type HealthCheck } from '../../../../utils/api-types';
import { scenarioKey } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';
import { retryUnlessClientError } from '../../../../utils/query/queryErrors';
import useNotifiedQuery, { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../utils/query/useNotifiedQuery';

// Sub-resource keys of one scenario screen. They all start with scenarioKey(id), so the topic
// 'scenario:<id>' refetches every one of them at once.
const subKey = (scenarioId: string, segment: string) => [...scenarioKey(scenarioId), segment] as const;

// Store-backed loaders: the data stays in Redux, read by many components. The datasets shared
// with the tabs (injects, teams, articles, ...) have their keys in scenarioStoreQueries.ts.
export const scenarioEntityKey = (scenarioId: string) => subKey(scenarioId, 'scenario');
export const scenarioExecutionSimulationKey = (scenarioId: string, simulationId: string) => [...subKey(scenarioId, 'execution-simulation'), simulationId] as const;

// Plain queries: the data lives in the query cache only.
export const scenarioHealthchecksKey = (scenarioId: string) => subKey(scenarioId, 'healthchecks');
export const scenarioExpectationsDriftKey = (scenarioId: string) => subKey(scenarioId, 'expectations-drift');
export const scenarioWorkflowStepsKey = (scenarioId: string, workflowId: string) => [...subKey(scenarioId, 'workflow-steps'), workflowId] as const;
export const scenarioSimulationsKey = (scenarioId: string) => subKey(scenarioId, 'simulations');
export const scenarioLatestResultsKey = (scenarioId: string) => subKey(scenarioId, 'latest-simulation-results');
export const scenarioStatisticKey = (scenarioId: string) => subKey(scenarioId, 'statistic');
export const scenarioLatestSimulationKey = (scenarioId: string, simulationIds: string[]) => [...subKey(scenarioId, 'latest-simulation'), simulationIds] as const;

// Refetches every query of the scenario screen after a local change. The stream sends the same
// invalidation a moment later; this one only spares the user the wait.
export const invalidateScenario = (scenarioId: string) => queryClient.invalidateQueries({ queryKey: scenarioKey(scenarioId) });

// Shared by the header and the overview: one fetch for both. Healthchecks also depend on platform
// state (collectors, agents, mail services) that no scenario invalidation announces, hence the
// fallback interval.
export const useScenarioHealthchecks = (scenarioId: string, enabled: boolean) => useNotifiedQuery({
  queryKey: scenarioHealthchecksKey(scenarioId),
  queryFn: () => searchScenarioHealthcheks(scenarioId, false).then((result: { data: HealthCheck[] }) => result.data),
  retry: retryUnlessClientError,
  refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
  enabled,
});
