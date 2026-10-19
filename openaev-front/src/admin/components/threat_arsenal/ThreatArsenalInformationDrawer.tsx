import { Alert, AlertTitle } from '@mui/material';
import { type FunctionComponent, useEffect, useState } from 'react';

import { fetchThreatArsenalAction } from '../../../actions/threat_arsenals/threatArsenal-actions';
import Drawer from '../../../components/common/Drawer';
import { useFormatter } from '../../../components/i18n';
import {
  type Payload,
  type ThreatArsenalAction,
  type ThreatArsenalActionFullOutput,
} from '../../../utils/api-types';
import { isClientError, retryUnlessClientError } from '../../../utils/query/queryErrors';
import useNotifiedQuery, { FALLBACK_REFETCH_INTERVAL_MS } from '../../../utils/query/useNotifiedQuery';
import { isFeatureEnabled } from '../../../utils/utils';
import ThreatArsenalActionOverview from './ThreatArsenalActionOverview';
import { threatArsenalActionOverviewKey } from './threatArsenalQueries';

const toPayload = (action: ThreatArsenalActionFullOutput): Payload => {
  return {
    payload_id: action.action_id,
    payload_name: action.action_labels?.en ?? Object.values(action.action_labels ?? {})[0] ?? '',
    payload_created_at: action.action_created_at,
    payload_updated_at: action.action_updated_at,
    payload_description: action.action_description,
    payload_execution_arch: action.action_execution_arch,
    payload_platforms: action.action_platforms ?? [],
    payload_source: action.action_source,
    payload_status: action.action_status,
    payload_type: action.action_type,
    payload_external_id: action.action_external_id,
    payload_arguments: action.action_arguments,
    payload_cleanup_command: action.action_cleanup_command,
    payload_cleanup_executor: action.action_cleanup_executor,
    payload_collector_type: action.action_collector_type,
    payload_detection_remediations: action.action_detection_remediations,
    payload_expectations: action.action_expectations,
    payload_expected_security_platforms: action.action_expected_security_platforms,
    payload_output_parsers: action.action_output_parsers,
    payload_prerequisites: action.action_prerequisites,
    command_content: action.command_content,
    command_executor: action.command_executor,
    dns_resolution_hostname: action.dns_resolution_hostname,
    executable_file: action.executable_file,
    file_drop_file: action.file_drop_file,
  } as Payload;
};

interface Props {
  open: boolean;
  onClose: () => void;
  threatArsenalAction: ThreatArsenalAction | null;
}

const ThreatArsenalInformationDrawer: FunctionComponent<Props> = ({
  open,
  onClose,
  threatArsenalAction,
}) => {
  const { t } = useFormatter();

  // With live updates on, the details are a query under the action's key, which the topic
  // 'payload:<id>' refetches, with a slow interval as fallback.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const actionId = threatArsenalAction?.injector_contract_id;
  const queryEnabled = liveUpdates && open && !!actionId;
  const detailsQuery = useNotifiedQuery({
    queryKey: threatArsenalActionOverviewKey(actionId ?? ''),
    queryFn: () => fetchThreatArsenalAction(actionId ?? '', false).then(result => result.data as ThreatArsenalActionFullOutput),
    enabled: queryEnabled,
    retry: retryUnlessClientError,
    // A failing action (deleted, rights lost) stops polling; an invalidation still refetches it.
    refetchInterval: query => (query.state.status === 'error' ? false : FALLBACK_REFETCH_INTERVAL_MS),
  });

  const [legacyLoading, setLoading] = useState(false);
  const [legacyFullOutput, setFullOutput] = useState<ThreatArsenalActionFullOutput | null>(null);

  useEffect(() => {
    if (liveUpdates) {
      return undefined;
    }
    // Reset state on every (re)entry so a previous in-flight fetch whose
    // `.finally()` was skipped by the cancellation guard can't leave the drawer
    // stuck on a spinner when the next opened action resolves quickly.
    if (!open || !threatArsenalAction) {
      setLoading(false);
      setFullOutput(null);
      return undefined;
    }

    setFullOutput(null);
    setLoading(true);
    let cancelled = false;
    // Always fetch the full details: both payload-based contracts (execution,
    // arguments, cleanup) and injector-based ones (e.g. AI Red Team) carry
    // predefined expectations we surface in the drawer.
    fetchThreatArsenalAction(threatArsenalAction.injector_contract_id)
      .then((result) => {
        if (cancelled) return;
        setFullOutput(result.data as ThreatArsenalActionFullOutput);
      })
      .catch(() => {
        if (cancelled) return;
        setFullOutput(null);
      })
      .finally(() => {
        // Keep the cancellation guard so a stale finally from a superseded
        // fetch can't clear the spinner of a newer in-flight fetch.
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, threatArsenalAction]);

  const fullOutput = liveUpdates ? (detailsQuery.data ?? null) : legacyFullOutput;
  const loading = liveUpdates ? queryEnabled && detailsQuery.isPending : legacyLoading;
  // Deleted or no longer visible, on a first load or while the drawer is open.
  const unavailable = liveUpdates && queryEnabled && isClientError(detailsQuery.error);

  // Only payload-based contracts produce a payload object (execution/arguments/
  // cleanup sections). Expectations are passed separately so injector-based
  // contracts without a payload still display them.
  const selectedPayload: Payload | null
    = fullOutput && threatArsenalAction?.action_payload ? toPayload(fullOutput) : null;

  const renderContent = () => {
    if (threatArsenalAction == null) {
      return <></>;
    }
    if (unavailable) {
      return (
        <Alert severity="warning">
          <AlertTitle>{t('Warning')}</AlertTitle>
          {t('Action is currently unavailable or you do not have sufficient permissions to access it.')}
        </Alert>
      );
    }
    return (
      <ThreatArsenalActionOverview
        action={threatArsenalAction}
        payload={selectedPayload}
        expectations={fullOutput?.action_expectations}
        expectationDetails={fullOutput?.action_expectation_details}
        expectedSecurityPlatforms={fullOutput?.action_expected_security_platforms}
        providing={fullOutput?.action_providing}
        loading={loading}
      />
    );
  };

  return (
    <Drawer
      open={open}
      handleClose={onClose}
      title={t('Action information')}
    >
      {renderContent()}
    </Drawer>
  );
};

export default ThreatArsenalInformationDrawer;
