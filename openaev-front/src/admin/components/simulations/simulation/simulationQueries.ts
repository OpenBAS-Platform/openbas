import { searchExerciseHealthchecks } from '../../../../actions/Exercise';
import { type HealthCheck } from '../../../../utils/api-types';
import { simulationKey } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';
import { retryUnlessClientError } from '../../../../utils/query/queryErrors';
import useNotifiedQuery, { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../utils/query/useNotifiedQuery';

// Sub-resource keys of one simulation screen. They all start with simulationKey(id), so the topic
// 'simulation:<id>' refetches every one of them at once.
const subKey = (simulationId: string, segment: string) => [...simulationKey(simulationId), segment] as const;

// Store-backed loaders: the data stays in Redux, read by many components. The datasets shared
// with the tabs (injects, teams, articles, ...) have their keys in simulationStoreQueries.ts.
export const simulationEntityKey = (simulationId: string) => subKey(simulationId, 'simulation');
export const simulationParentScenarioKey = (simulationId: string) => subKey(simulationId, 'parent-scenario');
export const simulationWorkflowConfigurationKey = (simulationId: string, workflowId: string) => [...subKey(simulationId, 'workflow-configuration'), workflowId] as const;

// Plain queries: the data lives in the query cache only.
export const simulationHealthchecksKey = (simulationId: string) => subKey(simulationId, 'healthchecks');
export const simulationExpectationsDriftKey = (simulationId: string) => subKey(simulationId, 'expectations-drift');
export const simulationResultsKey = (simulationId: string) => subKey(simulationId, 'expectation-results');
export const simulationAttackPatternResultsKey = (simulationId: string) => subKey(simulationId, 'attack-pattern-results');
export const simulationInjectsResultsKey = (simulationId: string) => subKey(simulationId, 'injects-results');
// No data: its refetch time versions the dashboard widgets, which refetch when it changes.
export const simulationDashboardVersionKey = (simulationId: string) => subKey(simulationId, 'dashboard-version');

// A running simulation changes its injects, expectations and results while on screen; each
// change is invalidated, the interval covers the ones no invalidation announces.
export const isSimulationLive = (status?: string) => status === 'RUNNING' || status === 'PAUSED';
export const liveRefetchInterval = (status?: string) => (isSimulationLive(status) ? FALLBACK_REFETCH_INTERVAL_MS : false);

// Refetches every query of the simulation screen after a local change. The stream sends the same
// invalidation a moment later; this one only spares the user the wait.
export const invalidateSimulation = (simulationId: string) => queryClient.invalidateQueries({ queryKey: simulationKey(simulationId) });

// Healthchecks also depend on platform state (collectors, agents, mail services, scope) that no
// simulation invalidation announces, hence the fallback interval.
export const useSimulationHealthchecks = (simulationId: string, enabled: boolean) => useNotifiedQuery({
  queryKey: simulationHealthchecksKey(simulationId),
  queryFn: () => searchExerciseHealthchecks(simulationId, false).then((result: { data: HealthCheck[] }) => result.data),
  retry: retryUnlessClientError,
  refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
  enabled,
});
