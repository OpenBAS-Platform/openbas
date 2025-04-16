import { type FunctionComponent, useContext, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { searchFindingsForInjects } from '../../../../actions/findings/finding-actions';
import { initSorting } from '../../../../components/common/queryable/Page';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import { useQueryableWithLocalStorage } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import {
  type Finding,
  type InjectResultOverviewOutput, type TargetSimple,
} from '../../../../utils/api-types';
import FindingList from '../../findings/FindingList';
import {
  InjectResultOverviewOutputContext,
  type InjectResultOverviewOutputContextType,
} from '../InjectResultOverviewOutputContext';

const AtomicTestingFindings: FunctionComponent = () => {
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };

  const availableFilterNames = ['finding_type'];
  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);
  const assetsMap = new Map<string, TargetSimple>();
  injectResultOverviewOutput?.inject_targets.forEach((target) => {
    assetsMap.set(target.id, {
      target_id: target.id,
      target_name: target.name,
      target_type: target.targetType,
    } as TargetSimple);
  });

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');

  const [findings, setFindings] = useState<Finding[]>([]);
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage('finding', buildSearchPagination({
    sorts: initSorting('finding_created_at'),
    textSearch: search,
  }));

  return (
    <>
      <PaginationComponentV2
        fetch={searchPaginationInput => searchFindingsForInjects(injectId, searchPaginationInput)}
        searchPaginationInput={searchPaginationInput}
        setContent={setFindings}
        entityPrefix="finding"
        availableFilterNames={availableFilterNames}
        queryableHelpers={queryableHelpers}
      />
      <FindingList findings={findings} sortHelpers={queryableHelpers.sortHelpers} assetsMap={assetsMap} />
    </>
  );
};

export default AtomicTestingFindings;
