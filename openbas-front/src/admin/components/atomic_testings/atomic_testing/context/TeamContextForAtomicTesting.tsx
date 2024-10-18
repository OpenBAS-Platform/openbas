import { TeamContextType } from '../../../common/Context';
import type { SearchPaginationInput, TeamOutput } from '../../../../../utils/api-types';
import type { Page } from '../../../../../components/common/queryable/Page';
import { searchAtomicTestingTeams } from '../../../../../actions/atomic_testings/atomic-testing-actions';

const teamContextForAtomicTesting = (): TeamContextType => {
  return {
    searchTeams(input: SearchPaginationInput, contextualOnly?: boolean): Promise<{ data: Page<TeamOutput> }> {
      return searchAtomicTestingTeams(input, contextualOnly);
    },
  };
};

export default teamContextForAtomicTesting;
