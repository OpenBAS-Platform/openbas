import { getInjectStatusWithGlobalExecutionTraces } from '../../../../../actions/injects/inject-action';
import { type InjectStatusOutput } from '../../../../../utils/api-types';
import { atomicTestingKey } from '../../../../../utils/query/keys';
import useNotifiedQuery from '../../../../../utils/query/useNotifiedQuery';

interface Options {
  enabled: boolean;
  refetchInterval?: number;
}

// Inject status with its global execution traces, under the atomic testing key: the hero (failure
// reason) and the "Execution details" tab share one cached copy.
const useInjectExecutionStatusQuery = (injectId: string | undefined, { enabled, refetchInterval }: Options) => useNotifiedQuery({
  queryKey: [...atomicTestingKey(injectId ?? ''), 'execution-status'],
  queryFn: () => getInjectStatusWithGlobalExecutionTraces(injectId, false)
    .then((response: { data?: InjectStatusOutput }) => response.data ?? null),
  enabled: enabled && !!injectId,
  refetchInterval,
});

export default useInjectExecutionStatusQuery;
