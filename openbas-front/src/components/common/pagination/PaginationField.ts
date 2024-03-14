export interface PaginationField {
  filterGroup?: FilterGroup;
  textSearch?: string;
  sorts?: SortField[];
}

enum FilterOperator {
  eq = 'eq',
}

enum FilterMode {
  and = 'and',
  or = 'or',
}

interface FilterGroup {
  mode: FilterMode;
  filters?: Filter[];
}

export interface Filter {
  key: string;
  mode: FilterMode;
  values: string[];
  operator: FilterOperator;
}

interface SortField {
  property?: string;
  direction?: string;
}

export const initFilterGroup: (key: string, values: string[]) => FilterGroup = (key: string, values: string[]) => {
  return {
    mode: FilterMode.and,
    filters: [{
      key,
      values,
      mode: FilterMode.and,
      operator: FilterOperator.eq,
    }],
  };
};

export const initSorting: (property: string) => SortField[] = (property: string) => {
  return [{ property }];
};

// Pageable

export interface Page<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: Sort;
  totalElements: number;
  totalPages: number;
}

interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: Sort;
  unpaged: boolean;
}

interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}
