import { useLocalStorage } from 'usehooks-ts';
import { useState } from 'react';
import useFiltersState from './filter/useFiltersState';
import type { FilterGroup, SearchPaginationInput, SortField } from '../../../utils/api-types';
import useTextSearchState from './textSearch/useTextSearchState';
import usPaginationState from './pagination/usPaginationState';
import { QueryableHelpers } from './QueryableHelpers';
import useSortState from './sort/useSortState';
import useUriState from './uri/useUriState';
import { buildSearchPagination } from './QueryableUtils';

const buildUseQueryable = (
  localStorageKey: string | null,
  initSearchPaginationInput: Partial<SearchPaginationInput>,
  searchPaginationInput: SearchPaginationInput,
  setSearchPaginationInput: React.Dispatch<React.SetStateAction<SearchPaginationInput>>,
) => {
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
  const [__, filterHelpers] = useFiltersState(searchPaginationInput.filterGroup, initSearchPaginationInput.filterGroup, (filterGroup: FilterGroup) => setSearchPaginationInput({
    ...searchPaginationInput,
    filterGroup,
  }));

  // Sorts
  const sortHelpers = useSortState(searchPaginationInput.sorts, (sorts: SortField[]) => setSearchPaginationInput({
    ...searchPaginationInput,
    sorts,
  }));

  // Uri
  let uriHelpers;
  if (localStorageKey) {
    uriHelpers = useUriState(localStorageKey, searchPaginationInput, (input: SearchPaginationInput) => setSearchPaginationInput(input));
  }

  const queryableHelpers: QueryableHelpers = {
    textSearchHelpers,
    paginationHelpers,
    filterHelpers,
    sortHelpers,
    uriHelpers,
  };

  return ({
    queryableHelpers,
    searchPaginationInput,
  });
};

export const useQueryable = (initSearchPaginationInput: Partial<SearchPaginationInput>) => {
  const finalSearchPaginationInput: SearchPaginationInput = buildSearchPagination(initSearchPaginationInput);

  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>(finalSearchPaginationInput);

  return buildUseQueryable(null, initSearchPaginationInput, searchPaginationInput, setSearchPaginationInput);
};

export const useQueryableWithLocalStorage = (localStorageKey: string, initSearchPaginationInput: Partial<SearchPaginationInput>) => {
  const finalSearchPaginationInput: SearchPaginationInput = buildSearchPagination(initSearchPaginationInput);

  const [searchPaginationInput, setSearchPaginationInput] = useLocalStorage<SearchPaginationInput>(localStorageKey, finalSearchPaginationInput);

  return buildUseQueryable(localStorageKey, initSearchPaginationInput, searchPaginationInput, setSearchPaginationInput);
};
