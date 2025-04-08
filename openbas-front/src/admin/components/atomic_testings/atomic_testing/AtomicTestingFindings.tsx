import { type FunctionComponent } from 'react';
import { useParams } from 'react-router';

import { searchFindingsForInjects } from '../../../../actions/findings/finding-actions';
import { type InjectResultOverviewOutput, type SearchPaginationInput } from '../../../../utils/api-types';
import FindingList from '../../findings/FindingList';

const AtomicTestingFindings: FunctionComponent = () => {
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };

  const additionalFilterNames = [
    'finding_assets',
  ];

  const search = (input: SearchPaginationInput) => {
    return searchFindingsForInjects(injectId, input);
  };

  return (
    <FindingList filterLocalStorageKey="atm-findings" additionalFilterNames={additionalFilterNames} searchFindings={search} />
  );
};

export default AtomicTestingFindings;
