import { Alert } from '@mui/material';
import { keepPreviousData, type QueryKey } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { getInjectStatusWithGlobalExecutionTraces, getInjectTracesFromInjectAndTarget } from '../../../../../actions/injects/inject-action';
import Empty from '../../../../../components/Empty';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { type ExecutionTraceOutput, type InjectStatusOutput } from '../../../../../utils/api-types';
import useNotifiedQuery, { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../../utils/query/useNotifiedQuery';
import AgentTraces from './traces/AgentTraces';
import EndpointTraces from './traces/EndpointTraces';
import MainTraces from './traces/MainTraces';
import TraceMessage from './traces/TraceMessage';

interface Props {
  injectId: string;
  target?: {
    id: string;
    name?: string;
    targetType: string;
    platformType?: string;
  };
  /** Inject-level execution status, used to surface global failure traces when the target has none. */
  injectStatusName?: string;
  /** Given a key, the traces are a query under it (refetched when it is invalidated) instead of a fetch on mount. */
  queryKey?: QueryKey;
}

interface TargetTraces {
  traces: ExecutionTraceOutput[];
  globalErrorTraces: ExecutionTraceOutput[];
}

// Inject-level statuses for which a target with no traces of its own is worth
// explaining with the global execution report (pre-execution failures).
const INJECT_ERROR_STATUSES = ['ERROR', 'PARTIAL'];

// Pre-execution failures (unmet dependencies, health-check or executor errors) are
// recorded as GLOBAL inject traces (no agent / target), so the per-target endpoint
// returns nothing and the Overview would just say "No traces on this target". Fetch the
// global report and surface its error trace(s) here so the failure reason is visible
// without opening the Execution details tab.
const fetchTargetTraces = async (
  injectId: string,
  targetId: string,
  targetType: string,
  injectStatusName: string | undefined,
  notifyError: boolean,
): Promise<TargetTraces> => {
  const result = await getInjectTracesFromInjectAndTarget(injectId, targetId, targetType, notifyError);
  const traces: ExecutionTraceOutput[] = result.data || [];
  if (traces.length === 0 && injectStatusName && INJECT_ERROR_STATUSES.includes(injectStatusName)) {
    const statusResult: { data: InjectStatusOutput } = await getInjectStatusWithGlobalExecutionTraces(injectId, notifyError);
    return {
      traces,
      globalErrorTraces: statusResult.data?.status_main_traces ?? [],
    };
  }
  return {
    traces,
    globalErrorTraces: [],
  };
};

const ExecutionStatusDetail = ({ injectId, target, injectStatusName, queryKey }: Props) => {
  const { t } = useFormatter();
  const [stateTraces, setStateTraces] = useState<ExecutionTraceOutput[]>([]);
  const [stateGlobalErrorTraces, setStateGlobalErrorTraces] = useState<ExecutionTraceOutput[]>([]);
  const [stateLoading, setStateLoading] = useState(false);
  const queryMode = queryKey !== undefined;

  const isTeam = target?.targetType === 'TEAMS';
  const isPlayer = target?.targetType === 'PLAYERS';
  // AI targets are assets (AiTarget extends Asset); their traces are asset-scoped.
  const isAsset = target?.targetType === 'ASSETS' || target?.targetType === 'AI_TARGETS';
  const isAgent = target?.targetType === 'AGENT';

  const fetchTraces = async () => {
    if (!target?.id || !target.targetType) return;
    setStateLoading(true);
    try {
      const result = await fetchTargetTraces(injectId, target.id, target.targetType, injectStatusName, true);
      setStateTraces(result.traces);
      setStateGlobalErrorTraces(result.globalErrorTraces);
    } finally {
      setStateLoading(false);
    }
  };

  useEffect(() => {
    if (!queryMode) {
      fetchTraces();
    }
  }, [injectId, target?.id, target?.targetType, injectStatusName, queryMode]);

  // Traces grow while the inject runs: the interval backs up the invalidations.
  const tracesQuery = useNotifiedQuery({
    queryKey: [...(queryKey ?? []), 'target-traces', injectId, target?.id, target?.targetType, injectStatusName],
    queryFn: () => fetchTargetTraces(injectId, target?.id ?? '', target?.targetType ?? '', injectStatusName, false),
    enabled: queryMode && !!target?.id && !!target.targetType,
    // A change of the inject status keeps the current traces on screen while the new key loads.
    placeholderData: keepPreviousData,
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
  });

  const traces = queryMode ? (tracesQuery.data?.traces ?? []) : stateTraces;
  const globalErrorTraces = queryMode ? (tracesQuery.data?.globalErrorTraces ?? []) : stateGlobalErrorTraces;
  // Only the first load shows the loader: a refetch keeps the traces on screen.
  const loading = queryMode ? tracesQuery.isLoading : stateLoading;

  if (loading) {
    return <Loader variant="inElement" />;
  }

  if (traces && traces.length === 0) {
    if (globalErrorTraces.length > 0) {
      return (
        <>
          <Alert severity="error" variant="outlined" sx={{ marginBottom: 2 }}>
            {t('The inject failed before reaching this target. See the reason below.')}
          </Alert>
          <TraceMessage traces={globalErrorTraces} />
        </>
      );
    }
    return <Empty message={t('No traces on this target.')} />;
  }

  // No wrapping card here: the parent section header already delimits the block,
  // and the per-agent card (AgentTraces) provides the single, subtle outline
  // around the timeline. This avoids stacking multiple outlined boxes.
  return (
    <>
      {!loading && traces && traces.length > 0 && (
        <>
          {(isTeam || isPlayer) && (<MainTraces traces={traces} />)}
          {isAsset && (<EndpointTraces key={target.id} tracesByAgent={traces} />)}
          {isAgent && (<AgentTraces traces={traces} />)}
        </>
      )}
    </>
  );
};

export default ExecutionStatusDetail;
