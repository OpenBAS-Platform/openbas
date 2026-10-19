import { useParams } from 'react-router';

import { searchDistinctFindingsForScenarios } from '../../../../../actions/findings/finding-actions';
import type { Scenario, SearchPaginationInput } from '../../../../../utils/api-types';
import { scenarioKey } from '../../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../../utils/utils';
import FindingList from '../../../findings/FindingList';

const ScenarioFindings = () => {
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };
  // With live updates on, the findings list is a query under the scenario key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  const searchDistinct = (input: SearchPaginationInput, notifyError?: boolean) => {
    return searchDistinctFindingsForScenarios(scenarioId, input, notifyError);
  };

  return (
    <FindingList
      filterLocalStorageKey="scenario-findings"
      searchDistinctFindings={searchDistinct}
      contextId={scenarioId}
      queryKey={liveUpdates ? [...scenarioKey(scenarioId), 'findings'] : undefined}
    />
  );
};
export default ScenarioFindings;
