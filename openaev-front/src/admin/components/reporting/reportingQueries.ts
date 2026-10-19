import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { fetchReportingGeneration } from '../../../actions/reporting/reporting-actions';
import { type Reporting, type ReportingGeneration } from '../../../utils/api-types';
import { reportKey, REPORTS_LIST_KEY } from '../../../utils/query/keys';
import queryClient from '../../../utils/query/queryClient';
import { isClientError } from '../../../utils/query/queryErrors';

// A generation started from the screen is polled at this pace until it ends.
export const GENERATION_POLL_INTERVAL_MS = 2500;
// ~3 minutes: past this the screen stops waiting for its generation and points to the history.
export const GENERATION_POLL_TIMEOUT_MS = 3 * 60 * 1000;
// Lists showing a pending or running generation are polled at this pace: a generation job may
// write its status without an invalidation.
export const ACTIVE_GENERATIONS_POLL_INTERVAL_MS = 5000;

export const isGenerationActive = (generation?: ReportingGeneration) => generation?.reporting_generation_status === 'PENDING'
  || generation?.reporting_generation_status === 'RUNNING';

// Every query of one report screen (the report with its schedules, its generations, a generation
// in progress) starts with reportKey(id), so the topic 'report:<id>' refetches all of them.
export const reportingEntityKey = (reportingId: string) => [...reportKey(reportingId), 'reporting'] as const;
export const reportingGenerationsKey = (reportingId: string) => [...reportKey(reportingId), 'generations'] as const;
export const reportingGenerationKey = (reportingId: string, generationId: string) => [...reportKey(reportingId), 'generation', generationId] as const;

// The reports of one entity (the reports panel of entity screens): several reports, so under the
// list topic 'list:reports'.
export const entityReportingsKey = (contextType: Reporting['reporting_context_type'], contextId: string) => [...REPORTS_LIST_KEY, 'context', contextType, contextId] as const;

export const invalidateReportsList = () => queryClient.invalidateQueries({ queryKey: REPORTS_LIST_KEY });
export const invalidateReport = (reportingId: string) => queryClient.invalidateQueries({ queryKey: reportKey(reportingId) });

interface GenerationProgressCallbacks {
  onSuccess: () => void;
  onFailure: (error?: string) => void;
  onTimeout: () => void;
}

/**
 * Follows one generation started from the screen until it ends: a query under the report's key,
 * refetched by the report's topic and polled while the generation is pending or running (a job
 * may write its status without an invalidation). Calls one callback, once, when the generation
 * succeeds, fails, disappears (failure without a message) or outlasts the timeout. A null
 * generation id follows nothing.
 */
export const useGenerationProgress = (
  reportingId: string | undefined,
  generationId: string | null,
  callbacks: GenerationProgressCallbacks,
) => {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const settledRef = useRef<string | null>(null);
  const enabled = !!reportingId && !!generationId;

  const { data, error } = useQuery({
    queryKey: reportingGenerationKey(reportingId ?? '', generationId ?? ''),
    // Polled: a failed attempt is silent, the next one retries.
    queryFn: () => fetchReportingGeneration(generationId ?? '', false).then((result: { data: ReportingGeneration }) => result.data),
    enabled,
    retry: false,
    refetchInterval: (query) => {
      if (isClientError(query.state.error)) {
        return false;
      }
      return query.state.data === undefined || isGenerationActive(query.state.data) ? GENERATION_POLL_INTERVAL_MS : false;
    },
  });

  const settle = (notify: (current: GenerationProgressCallbacks) => void) => {
    if (!generationId || settledRef.current === generationId) {
      return;
    }
    settledRef.current = generationId;
    notify(callbacksRef.current);
  };

  const status = enabled ? data?.reporting_generation_status : undefined;
  useEffect(() => {
    if (status === 'SUCCESS') {
      settle(current => current.onSuccess());
    } else if (status === 'ERROR') {
      settle(current => current.onFailure(data?.reporting_generation_error));
    }
  }, [status, generationId]);

  const gone = enabled && isClientError(error);
  useEffect(() => {
    if (gone) {
      settle(current => current.onFailure());
    }
  }, [gone, generationId]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const timer = setTimeout(() => settle(current => current.onTimeout()), GENERATION_POLL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [enabled, generationId]);
};
