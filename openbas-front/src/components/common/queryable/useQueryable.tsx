import { useLocalStorage } from 'usehooks-ts';
import useFiltersState from './filter/useFiltersState';
import type { FilterGroup, SearchPaginationInput } from '../../../utils/api-types';
import useTextSearchState from './textSearch/useTextSearchState';
import usPaginationState, { ROWS_PER_PAGE_OPTIONS } from './pagination/usPaginationState';
import { QueryableHelpers } from './QueryableHelpers';

export const buildSearchPagination = (searchPaginationInput: Partial<SearchPaginationInput>) => {
  return ({
    page: 0,
    size: ROWS_PER_PAGE_OPTIONS[0],
    ...searchPaginationInput,
  });
};

const useQueryable = (localStorageKey: string, initSearchPaginationInput: Partial<SearchPaginationInput>) => {

  const finalSearchPaginationInput: SearchPaginationInput = buildSearchPagination(initSearchPaginationInput);

  const [searchPaginationInput, setSearchPaginationInput] = useLocalStorage<SearchPaginationInput>(localStorageKey, finalSearchPaginationInput);

  // Text Search
  const textSearchHelpers = useTextSearchState(searchPaginationInput.textSearch, (textSearch: string, page: number) => setSearchPaginationInput({
    ...searchPaginationInput,
    textSearch,
    page,
  }));

  // Pagination
  const paginationHelpers = usPaginationState(searchPaginationInput.size, (page: number, size: number) => setSearchPaginationInput({
    ...searchPaginationInput,
    page,
    size,
  }));

  // Filters
  const [__, filterHelpers] = useFiltersState(initSearchPaginationInput.filterGroup, (filterGroup: FilterGroup) => setSearchPaginationInput({
    ...searchPaginationInput,
    filterGroup,
  }));

  const queryableHelpers: QueryableHelpers = {
    textSearchHelpers,
    paginationHelpers,
    filterHelpers,
  };

  return ({
    queryableHelpers,
    searchPaginationInput,
  });
};

export default useQueryable;
