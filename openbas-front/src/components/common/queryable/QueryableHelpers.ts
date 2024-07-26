import { TextSearchHelpers } from './textSearch/TextSearchHelpers';
import { PaginationHelpers } from './pagination/PaginationHelpers';
import { FilterHelpers } from './filter/FilterHelpers';

export interface QueryableHelpers {
  textSearchHelpers: TextSearchHelpers;
  paginationHelpers: PaginationHelpers;
  filterHelpers: FilterHelpers;
}
