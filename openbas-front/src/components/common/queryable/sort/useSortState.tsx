import { useEffect, useRef, useState } from 'react';
import type { SortField } from '../../../../utils/api-types';
import { SortHelpers } from './SortHelpers';

const computeDirection = (direction?: string) => {
  if (direction) {
    return direction === 'ASC';
  }
  return false;
};

const useSortState = (initSorts: SortField[] = [], onChange?: (sorts: SortField[]) => void) => {
  const [sortBy, setSortBy] = useState(initSorts?.[0]?.property ?? '');
  const [sortAsc, setSortAsc] = useState(computeDirection(initSorts?.[0]?.direction));
  const hasBeenInitialized = useRef<boolean>(false);

  const helpers: SortHelpers = {
    handleSort: (field: string) => {
      setSortBy(field);
      setSortAsc(!sortAsc);
    },
    getSortBy: () => sortBy,
    getSortAsc: () => sortAsc,
  };

  useEffect(() => {
    if (hasBeenInitialized.current) {
      onChange?.([{ direction: sortAsc ? 'ASC' : 'DESC', property: sortBy }]);
    }
    hasBeenInitialized.current = true;
  }, [sortBy, sortAsc]);

  return helpers;
};

export default useSortState;
