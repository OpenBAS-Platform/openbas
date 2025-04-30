import { searchFindings } from '../../../actions/findings/finding-actions';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { useFormatter } from '../../../components/i18n';
import type { FindingOutput } from '../../../utils/api-types';
import { renderReference } from '../../../utils/String';
import FindingList from './FindingList';

const Findings = () => {
  const { t } = useFormatter();

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
      value: (finding: FindingOutput) => renderReference(finding.finding_scenario?.scenario_name, finding.finding_scenario?.scenario_id, '/admin/scenarios'),
    },
    {
      field: 'finding_simulation',
      label: 'Simulation',
      isSortable: false,
      value: (finding: FindingOutput) => renderReference(finding.finding_simulation?.exercise_name, finding.finding_simulation?.exercise_id, '/admin/simulations'),
    },
    {
      field: 'finding_inject',
      label: 'Inject',
      isSortable: false,
      value: (finding: FindingOutput) => renderReference(finding.finding_inject?.inject_title, finding.finding_inject?.inject_id, '/admin/injects'),
    },
  ];
  return (
    <>
      <Breadcrumbs
        variant="list"
        elements={[{
          label: t('Findings'),
          current: true,
        }]}
      />
      <FindingList
        searchFindings={searchFindings}
        additionalHeaders={additionalHeaders}
        additionalFilterNames={additionalFilterNames}
        filterLocalStorageKey="findings"
      />
    </>
  );
};

export default Findings;
