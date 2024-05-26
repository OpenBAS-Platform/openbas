import { useEffect, useRef, useState } from 'react';
import useFiltersState from './filter/useFiltersState';
import type { FilterGroup, SearchPaginationInput } from '../../utils/api-types';

const usePaginationAndFilter = (filter: FilterGroup, paginationInitial: SearchPaginationInput) => {
  const [searchPaginationInputTmp, setSearchPaginationInputTmp] = useState<SearchPaginationInput>();
  const prevSearchPaginationInputTmp = useRef<SearchPaginationInput>();

  const [filterGroup, helpers] = useFiltersState(filter, (f: FilterGroup) => setSearchPaginationInputTmp({
    ...paginationInitial,
    filterGroup: f,
  }));

  const [searchPaginationInput, setSearchPaginationInput] = useState<SearchPaginationInput>({
    ...paginationInitial,
    filterGroup,
  });

  useEffect(() => {
    if (prevSearchPaginationInputTmp.current && searchPaginationInputTmp?.filterGroup) {
      setSearchPaginationInput(searchPaginationInputTmp);
    }
    prevSearchPaginationInputTmp.current = searchPaginationInputTmp;
  }, [searchPaginationInputTmp]);

  return ({ filterGroup, helpers, searchPaginationInput, setSearchPaginationInput });
};

export default usePaginationAndFilter;
