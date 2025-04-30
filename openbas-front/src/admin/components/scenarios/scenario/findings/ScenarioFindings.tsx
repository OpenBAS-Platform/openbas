import { useParams } from 'react-router';

import { searchFindingsForScenarios } from '../../../../../actions/findings/finding-actions';
import FindingReferenceLink from '../../../../../components/common/FindingReferenceLink';
import type { FindingOutput, Scenario, SearchPaginationInput } from '../../../../../utils/api-types';
import { SIMULATION } from '../../../../../utils/String';
import FindingList from '../../../findings/FindingList';

const ScenarioFindings = () => {
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };

  const additionalFilterNames = [
    'finding_inject_id',
    'finding_simulation',
  ];

  const search = (input: SearchPaginationInput) => {
    return searchFindingsForScenarios(scenarioId, input);
  };

  const additionalHeaders = [
    {
      field: 'finding_simulation',
      label: 'Simulation',
      isSortable: false,
      value: (finding: FindingOutput) => <FindingReferenceLink finding={finding} type={SIMULATION} />,
    },
  ];

  return (
    <FindingList
      filterLocalStorageKey="scenario-findings"
      searchFindings={search}
      additionalHeaders={additionalHeaders}
      additionalFilterNames={additionalFilterNames}
      contextId={scenarioId}
    />
  );
};
export default ScenarioFindings;
