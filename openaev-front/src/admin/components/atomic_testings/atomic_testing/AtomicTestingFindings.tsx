import { type FunctionComponent } from 'react';
import { useParams } from 'react-router';

import { searchDistinctFindingsForInjects } from '../../../../actions/findings/finding-actions';
import { type InjectResultOverviewOutput, type SearchPaginationInput } from '../../../../utils/api-types';
import { atomicTestingKey } from '../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../utils/utils';
import FindingList from '../../findings/FindingList';

const AtomicTestingFindings: FunctionComponent = () => {
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };
  // With live updates on, the findings are a query under the atomic testing key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  const searchDistinct = (input: SearchPaginationInput, notifyError?: boolean) => {
    return searchDistinctFindingsForInjects(injectId, input, notifyError);
  };

  return (
    <FindingList
      filterLocalStorageKey="atm-findings"
      searchDistinctFindings={searchDistinct}
      contextId={injectId}
      queryKey={liveUpdates ? [...atomicTestingKey(injectId), 'findings'] : undefined}
    />
  );
};

export default AtomicTestingFindings;
