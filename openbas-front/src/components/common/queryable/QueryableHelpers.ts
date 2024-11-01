import { FilterHelpers } from './filter/FilterHelpers';
import { PaginationHelpers } from './pagination/PaginationHelpers';
import { SortHelpers } from './sort/SortHelpers';
import { TextSearchHelpers } from './textSearch/TextSearchHelpers';
import { UriHelpers } from './uri/UriHelpers';

export interface QueryableHelpers {
  textSearchHelpers: TextSearchHelpers;
  paginationHelpers: PaginationHelpers;
  filterHelpers: FilterHelpers;
  sortHelpers: SortHelpers;
  uriHelpers?: UriHelpers;
}
