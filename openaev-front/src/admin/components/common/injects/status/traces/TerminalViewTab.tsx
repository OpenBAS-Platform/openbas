import { type QueryKey } from '@tanstack/react-query';
import { type FunctionComponent, useMemo } from 'react';

import useFetchInjectExecutionResult from '../../../../../../actions/inject_status/useFetchInjectExecutionResult';
import useInjectExecutionResultQuery from '../../../../../../actions/inject_status/useInjectExecutionResultQuery';
import Empty from '../../../../../../components/Empty';
import { useFormatter } from '../../../../../../components/i18n';
import type { InjectResultPayloadExecutionOutput, InjectTarget } from '../../../../../../utils/api-types';
import TerminalView from './TerminalView';

interface Props {
  injectId: string;
  target: InjectTarget;
  // Given a key, the execution result is a query under it, refetched when it is invalidated.
  queryKey?: QueryKey;
}

interface ContentProps {
  injectExecutionResult?: InjectResultPayloadExecutionOutput | null;
  loading: boolean;
}

const TerminalViewContent: FunctionComponent<ContentProps> = ({ injectExecutionResult, loading }) => {
  const { t } = useFormatter();

  const nonEmptyTraces = useMemo(() => {
    if (!injectExecutionResult?.execution_traces) {
      return [];
    }

    return Object.entries(injectExecutionResult.execution_traces)
      .filter(([, traces]) => traces.length > 0);
  }, [injectExecutionResult]);

  if (loading || nonEmptyTraces.length === 0) {
    return <Empty message={t('No traces on this target.')} />;
  }

  // No wrapping card: the section header delimits the block and each terminal
  // renders its own strong dark panel, so an extra outline would just add noise.
  return (
    <>
      {nonEmptyTraces.map(([key, value]) => (
        <TerminalView
          key={key}
          payloadCommandBlocks={injectExecutionResult?.payload_command_blocks ?? []}
          traces={value}
        />
      ))}
    </>
  );
};

const FetchedTerminalViewTab: FunctionComponent<Props> = ({ injectId, target }) => {
  const { injectExecutionResult, loading } = useFetchInjectExecutionResult(injectId, target);
  return <TerminalViewContent injectExecutionResult={injectExecutionResult} loading={loading} />;
};

const QueriedTerminalViewTab: FunctionComponent<Props & { queryKey: QueryKey }> = ({ injectId, target, queryKey }) => {
  const { injectExecutionResult, loading } = useInjectExecutionResultQuery(queryKey, injectId, target);
  return <TerminalViewContent injectExecutionResult={injectExecutionResult} loading={loading} />;
};

const TerminalViewTab: FunctionComponent<Props> = ({ injectId, target, queryKey }) => (queryKey
  ? <QueriedTerminalViewTab injectId={injectId} target={target} queryKey={queryKey} />
  : <FetchedTerminalViewTab injectId={injectId} target={target} />);

export default TerminalViewTab;
