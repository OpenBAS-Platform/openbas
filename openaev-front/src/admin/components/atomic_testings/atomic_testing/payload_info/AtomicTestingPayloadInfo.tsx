import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { fetchAtomicTestingPayload, fetchAtomicTestingPayloadQuery } from '../../../../../actions/atomic_testings/atomic-testing-actions';
import { type StatusPayloadOutput } from '../../../../../utils/api-types';
import { atomicTestingKey } from '../../../../../utils/query/keys';
import useNotifiedQuery from '../../../../../utils/query/useNotifiedQuery';
import { isFeatureEnabled } from '../../../../../utils/utils';
import CommandsInfoCard from './CommandsInfoCard';
import OutputParserInfoCard from './OutputParserInfoCard';
import PayloadInfoPaper from './PayloadInfoPaper';

const AtomicTestingPayloadInfo: FunctionComponent = () => {
  const theme = useTheme();
  const { injectId } = useParams();
  // With live updates on, the payload is a query under the atomic testing key. It does not change
  // while the screen is open, so it has no refetch interval.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const [statePayloadOutput, setPayloadOutput] = useState<StatusPayloadOutput>();

  // Fetching data
  useEffect(() => {
    if (injectId && !liveUpdates) {
      fetchAtomicTestingPayload(injectId).then((result: { data: StatusPayloadOutput }) => {
        setPayloadOutput(result.data);
      });
    }
  }, [injectId, liveUpdates]);

  const { data: queryPayloadOutput } = useNotifiedQuery({
    queryKey: [...atomicTestingKey(injectId ?? ''), 'payload'],
    queryFn: () => fetchAtomicTestingPayloadQuery(injectId ?? '', false)
      .then((result: { data?: StatusPayloadOutput }) => result.data ?? null),
    enabled: liveUpdates && !!injectId,
  });

  const payloadOutput = liveUpdates ? (queryPayloadOutput ?? undefined) : statePayloadOutput;

  return (
    <div
      id="atomic-testing-info"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
      }}
    >
      <PayloadInfoPaper payloadOutput={payloadOutput} />
      <CommandsInfoCard payloadOutput={payloadOutput} />
      <OutputParserInfoCard outputParsers={payloadOutput?.payload_output_parsers || []} />
    </div>
  );
};

export default AtomicTestingPayloadInfo;
