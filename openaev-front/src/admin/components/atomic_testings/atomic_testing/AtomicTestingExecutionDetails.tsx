import { type FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { getInjectStatusWithGlobalExecutionTraces } from '../../../../actions/injects/inject-action';
import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type InjectStatusOutput } from '../../../../utils/api-types';
import { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../utils/query/useNotifiedQuery';
import { isFeatureEnabled } from '../../../../utils/utils';
import GlobalExecutionTraces from '../../common/injects/status/traces/GlobalExecutionTraces';
import useInjectExecutionStatusQuery from './context/useInjectExecutionStatusQuery';

// "Execution details" tab: the global execution report (start / end / duration
// stat pills + the full traces timeline), shared by the atomic testing page and
// the simulation inject result page.
const AtomicTestingExecutionDetails: FunctionComponent = () => {
  const { t } = useFormatter();
  const { injectId } = useParams();
  // With live updates on, the report is a query under the atomic testing key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const [stateLoading, setStateLoading] = useState<boolean>(true);
  const [stateInjectStatus, setStateInjectStatus] = useState<InjectStatusOutput>();

  useEffect(() => {
    if (!injectId || liveUpdates) return;
    setStateLoading(true);
    getInjectStatusWithGlobalExecutionTraces(injectId)
      .then((response: { data: InjectStatusOutput }) => setStateInjectStatus(response.data))
      .finally(() => setStateLoading(false));
  }, [injectId, liveUpdates]);

  // Traces grow while the inject runs: the interval backs up the invalidations.
  const statusQuery = useInjectExecutionStatusQuery(injectId, {
    enabled: liveUpdates,
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
  });

  const loading = liveUpdates ? statusQuery.isPending : stateLoading;
  const injectStatus = liveUpdates ? (statusQuery.data ?? undefined) : stateInjectStatus;

  if (loading) {
    return <Loader variant="inElement" />;
  }

  return injectStatus
    ? <GlobalExecutionTraces injectStatus={injectStatus} />
    : <Empty message={t('No data available')} />;
};

export default AtomicTestingExecutionDetails;
