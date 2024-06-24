import { ColumnSort } from '@tanstack/react-table';
import type { SortField } from '../../../../utils/api-types';

// eslint-disable-next-line import/prefer-default-export
export const transformSortingValueToParams = (
  sortingValue?: ColumnSort[],
): SortField => {
  if (sortingValue && sortingValue[0]) {
    const { id, desc } = sortingValue[0];
    if (desc) {
      return { property: id, direction: 'desc' };
    }
    return { property: id, direction: 'asc' };
  }
  return {};
};
