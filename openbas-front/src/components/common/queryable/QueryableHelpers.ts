import { TextSearchHelpers } from './textSearch/TextSearchHelpers';
import { PaginationHelpers } from './pagination/PaginationHelpers';
import { FilterHelpers } from './filter/FilterHelpers';
import { SortHelpers } from './sort/SortHelpers';

export interface QueryableHelpers {
  textSearchHelpers: TextSearchHelpers;
  paginationHelpers: PaginationHelpers;
  filterHelpers: FilterHelpers;
  sortHelpers: SortHelpers;
}
