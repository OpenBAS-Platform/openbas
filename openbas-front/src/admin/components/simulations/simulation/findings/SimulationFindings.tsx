import { useParams } from 'react-router';

import { searchFindingsForSimulations } from '../../../../../actions/findings/finding-actions';
import { INJECT } from '../../../../../constants/Entities';
import type { Exercise, FindingOutput, SearchPaginationInput } from '../../../../../utils/api-types';
import FindingContextLink from '../../../findings/FindingContextLink';
import FindingList from '../../../findings/FindingList';

const SimulationFindings = () => {
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };

  const additionalFilterNames = [
    'finding_inject_id',
  ];

  const search = (input: SearchPaginationInput) => {
    return searchFindingsForSimulations(exerciseId, input);
  };
  const additionalHeaders = [
    {
      field: 'finding_inject',
      label: 'Inject',
      isSortable: false,
      value: (finding: FindingOutput) => <FindingContextLink finding={finding} type={INJECT} />,
    },
  ];

  return (
    <FindingList
      filterLocalStorageKey="simulation-findings"
      searchFindings={search}
      additionalHeaders={additionalHeaders}
      additionalFilterNames={additionalFilterNames}
      contextId={exerciseId}
    />
  );
};
export default SimulationFindings;
