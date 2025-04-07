import { searchFindings } from '../../../actions/findings/finding-actions';
import type { Header } from '../../../components/common/SortHeadersList';
import { type FindingOutput } from '../../../utils/api-types';
import FindingList from './FindingList';

const Findings = () => {
  const additionalFilterNames = [
    'finding_inject',
    'finding_scenario',
    'finding_simulation',
    // asset_group ?? TODO
  ];

  const additionalHeaders = [
    {
      field: 'finding_inject',
      label: 'Inject',
      isSortable: false,
      value: (finding: FindingOutput) => finding.finding_inject?.inject_title,
    },
    {
      field: 'finding_simulation',
      label: 'Simulation',
      isSortable: false,
      value: (finding: FindingOutput) => finding.finding_simulation?.exercise_name || '-',
    },
    {
      field: 'finding_scenario',
      label: 'Scenario',
      isSortable: false,
      value: (finding: FindingOutput) => finding.finding_scenario?.scenario_name || '-',
    },
  ];
  return (
    <FindingList
      searchFindings={searchFindings}
      additionalFilterNames={additionalFilterNames}
      additionalHeaders={additionalHeaders as Header[]}
    />
  );
};

export default Findings;
