import { useParams } from 'react-router';

import { searchDistinctFindingsForSimulations } from '../../../../../actions/findings/finding-actions';
import type { Exercise, SearchPaginationInput } from '../../../../../utils/api-types';
import { simulationKey } from '../../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../../utils/utils';
import FindingList from '../../../findings/FindingList';

const SimulationFindings = () => {
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };

  // With live updates on, the findings list is a query under the simulation key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  const searchDistinct = (input: SearchPaginationInput, notifyError?: boolean) => {
    return searchDistinctFindingsForSimulations(exerciseId, input, notifyError);
  };

  return (
    <FindingList
      filterLocalStorageKey={`simulation-findings_${exerciseId}`}
      searchDistinctFindings={searchDistinct}
      contextId={exerciseId}
      queryKey={liveUpdates ? [...simulationKey(exerciseId), 'findings'] : undefined}
    />
  );
};
export default SimulationFindings;
