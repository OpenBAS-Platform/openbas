import { searchFindings } from '../../../actions/findings/finding-actions';
import type { FindingOutput } from '../../../utils/api-types';
import FindingList from './FindingList';

const Findings = () => {
  const additionalFilterNames = [
    'finding_inject_id',
    'finding_scenario',
    'finding_simulation',
  ];

  const additionalHeaders = [
    {
      field: 'finding_scenario',
      label: 'Scenario',
      isSortable: false,
      value: (finding: FindingOutput) => finding.finding_scenario?.scenario_name || '-',
    },
    {
      field: 'finding_simulation',
      label: 'Simulation',
      isSortable: false,
      value: (finding: FindingOutput) => finding.finding_simulation?.exercise_name || '-',
    },
    {
      field: 'finding_inject',
      label: 'Inject',
      isSortable: false,
      value: (finding: FindingOutput) => finding.finding_inject?.inject_title,
    },
  ];
  return (
    <FindingList
      searchFindings={searchFindings}
      additionalHeaders={additionalHeaders}
      additionalFilterNames={additionalFilterNames}
      filterLocalStorageKey="findings"
    />
  );
};

export default Findings;
