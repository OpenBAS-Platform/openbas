import { useQuery } from '@tanstack/react-query';
import { type FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { fetchSimulationsMetaById } from '../../../../../actions/attack-path/attack-path-actions';
import { fetchExercise } from '../../../../../actions/Exercise';
import { type ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import Empty from '../../../../../components/Empty';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { useHelper } from '../../../../../store';
import { type ExerciseSimple, type Scenario } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../../utils/query/useNotifiedQuery';
import useStoreQuery from '../../../../../utils/query/useStoreQuery';
import { isFeatureEnabled } from '../../../../../utils/utils';
import ExecutionOverview from '../../../simulations/simulation/timeline/ExecutionOverview';
import { scenarioExecutionSimulationKey, scenarioLatestSimulationKey } from '../scenarioQueries';

const mostRecentSimulationId = (simulations: ExerciseSimple[] | undefined, simulationIds: string[]) => {
  const mostRecent = [...(simulations ?? [])].sort((a, b) =>
    (b.exercise_start_date ?? '').localeCompare(a.exercise_start_date ?? ''))[0];
  return mostRecent?.exercise_id ?? simulationIds[0];
};

const fetchLatestSimulationId = (simulationIds: string[]) => fetchSimulationsMetaById(simulationIds)
  .then(({ data }) => mostRecentSimulationId(data, simulationIds))
  // The metadata read is display-only; fall back to the first id so the overview still loads.
  .catch(() => simulationIds[0]);

// Scenario-context Execution tab. Like the Attack path tab, it reflects the scenario's most recent
// simulation - the live execution overview (hero, attack timeline, execution board), refreshed in
// real time. The simulation right-hand execution menu is dropped: this is a read-only mirror of the
// latest run, not the full simulation execution area. Available for every scenario type (time-based,
// chained, autonomous). The scenario is already loaded by the parent Index route.
const ScenarioExecution: FunctionComponent = () => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };
  const { scenario } = useHelper((helper: ScenariosHelper) => ({ scenario: helper.getScenario(scenarioId) }));
  // Stable reference so the resolution effect does not refetch on every render.
  const exerciseIds = useMemo(() => scenario?.scenario_exercises ?? [], [scenario?.scenario_exercises]);

  // With live updates on, the latest simulation and its entity are queries under scenarioKey(id),
  // refetched by the topic 'scenario:<id>'; the state below only serves the legacy path.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const latestQuery = useQuery({
    queryKey: scenarioLatestSimulationKey(scenarioId, exerciseIds),
    queryFn: () => fetchLatestSimulationId(exerciseIds),
    enabled: liveUpdates && exerciseIds.length > 0,
  });

  const [legacyLatestSimulationId, setLatestSimulationId] = useState<string | null>(null);
  const [legacyResolving, setResolving] = useState<boolean>(true);
  const latestSimulationId = liveUpdates
    ? (exerciseIds.length > 0 && latestQuery.data) || null
    : legacyLatestSimulationId;
  const resolving = liveUpdates
    ? exerciseIds.length > 0 && latestQuery.isPending
    : legacyResolving;

  // Resolve the most recent simulation of this scenario by start date - the same way the Attack path
  // tab seeds its default run - then hand it to the shared Execution overview.
  useEffect(() => {
    if (liveUpdates) {
      return undefined;
    }
    let cancelled = false;
    if (exerciseIds.length === 0) {
      setLatestSimulationId(null);
      setResolving(false);
      return () => {
        cancelled = true;
      };
    }
    setResolving(true);
    fetchSimulationsMetaById(exerciseIds)
      .then(({ data }) => {
        if (cancelled) return;
        setLatestSimulationId(mostRecentSimulationId(data, exerciseIds));
      })
      .catch(() => {
        // The metadata read is display-only; fall back to the first id so the overview still loads.
        if (!cancelled) setLatestSimulationId(exerciseIds[0]);
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseIds]);

  // The Execution overview reads the simulation from the store but does not fetch it itself (the
  // simulation Index normally does), so load it here - through useDataLoader so it also refreshes on
  // every stream reconnect, matching the simulation cockpit.
  useDataLoader(() => {
    if (latestSimulationId && !liveUpdates) {
      dispatch(fetchExercise(latestSimulationId));
    }
  }, [latestSimulationId]);
  // A running simulation changes while on screen, hence the fallback interval.
  useStoreQuery(
    scenarioExecutionSimulationKey(scenarioId, latestSimulationId ?? ''),
    () => dispatch(fetchExercise(latestSimulationId ?? '')),
    {
      enabled: liveUpdates && !!latestSimulationId,
      refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
    },
  );

  if (resolving) {
    return <Loader />;
  }
  if (!latestSimulationId) {
    return <Empty message={t('No simulation has run for this scenario yet.')} />;
  }
  return (
    <ExecutionOverview exerciseId={latestSimulationId} showMenu={false} />
  );
};

export default ScenarioExecution;
