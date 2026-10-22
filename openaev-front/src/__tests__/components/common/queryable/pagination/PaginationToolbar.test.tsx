import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PaginationToolbar from '../../../../../components/common/queryable/pagination/PaginationToolbar';
import { type QueryableHelpers } from '../../../../../components/common/queryable/QueryableHelpers';

vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (value: string) => value }) }));

vi.mock('../../../../../actions/schema/schema-action', () => ({ engineSchemas: vi.fn(() => Promise.resolve({ data: [] })) }));

vi.mock('../../../../../admin/components/common/filters/useKillChains', () => ({ default: () => ({}) }));
vi.mock('../../../../../admin/components/common/filters/KillChainSelect', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/common/filters/MitreFilter', () => ({
  default: () => null,
  MITRE_FILTER_KEY: 'mitre',
}));
vi.mock('../../../../../components/common/queryable/filter/FilterAutocomplete', () => ({ default: () => null }));
vi.mock('../../../../../components/common/queryable/filter/FilterChips', () => ({ default: () => null }));
vi.mock('../../../../../components/common/queryable/filter/useFilterableProperties', () => ({ default: () => Promise.resolve([]) }));
vi.mock('../../../../../components/common/queryable/textSearch/TextSearchComponent', () => ({ default: () => null }));
vi.mock('../../../../../components/common/queryable/pagination/TablePaginationComponentV2', () => ({ default: () => null }));

const handleChangeTotalElements = vi.fn();
const handleChangePage = vi.fn();
const updateUri = vi.fn();

const helpers = {
  uriHelpers: { updateUri },
  paginationHelpers: {
    handleChangeTotalElements,
    handleChangePage,
  },
  filterHelpers: undefined,
  textSearchHelpers: {},
} as unknown as QueryableHelpers;

const data = (pageNumber: number, totalPages: number, totalElements: number) => ({
  totalElements,
  totalPages,
  pageable: { pageNumber },
}) as Parameters<typeof PaginationToolbar>[0]['data'];

const renderToolbar = (result?: Parameters<typeof PaginationToolbar>[0]['data']) => render(
  <PaginationToolbar
    searchPaginationInput={{
      page: 0,
      size: 20,
    }}
    queryableHelpers={helpers}
    data={result}
    disableFilters
  />,
);

describe('PaginationToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('mirrors the total of the external result into the pagination helpers', () => {
    // Act
    renderToolbar(data(0, 3, 42));

    // Assert
    expect(handleChangeTotalElements).toHaveBeenCalledWith(42);
    expect(handleChangePage).not.toHaveBeenCalled();
  });

  it('goes to the new last page when the current page fell past the end', () => {
    // Act
    renderToolbar(data(4, 3, 45));

    // Assert
    expect(handleChangePage).toHaveBeenCalledWith(2);
  });

  it('goes back to the first page when the result is empty and the current page is past it', () => {
    // Act
    renderToolbar(data(2, 0, 0));

    // Assert
    expect(handleChangePage).toHaveBeenCalledWith(0);
  });

  it('does not loop on an empty result at the first page', () => {
    // Act
    renderToolbar(data(0, 0, 0));

    // Assert
    expect(handleChangePage).not.toHaveBeenCalled();
  });

  it('leaves the pagination helpers alone without an external result', () => {
    // Act
    renderToolbar();

    // Assert
    expect(handleChangeTotalElements).not.toHaveBeenCalled();
    expect(updateUri).toHaveBeenCalled();
  });
});
