import { searchFindings } from '../../../actions/findings/finding-actions';
import FindingList from './FindingList';

const Findings = () => {
  const additionalFilterNames = [
    'finding_inject',
    'finding_scenario',
    'finding_simulation',
  ];

  return (
    <FindingList
      searchFindings={searchFindings}
      additionalFilterNames={additionalFilterNames}
      filterLocalStorageKey="findings"
    />
  );
};

export default Findings;
