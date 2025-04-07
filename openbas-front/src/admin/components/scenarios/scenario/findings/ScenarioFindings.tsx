import { useParams } from 'react-router';

import { searchFindingsForScenarios } from '../../../../../actions/findings/finding-actions';
import type {
  FindingOutput,
  Scenario,
  SearchPaginationInput,
} from '../../../../../utils/api-types';
import FindingList from '../../../findings/FindingList';

const ScenarioFindings = () => {
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };

  const additionalFilterNames = [
    'finding_inject',
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
      value: (finding: FindingOutput) => finding.finding_simulation?.exercise_name || '-',
    },
  ];

  return (
    <FindingList
      filterLocalStorageKey="scenario-findings"
      searchFindings={search}
      additionalHeaders={additionalHeaders}
      additionalFilterNames={additionalFilterNames}
    />
  );
};
export default ScenarioFindings;
