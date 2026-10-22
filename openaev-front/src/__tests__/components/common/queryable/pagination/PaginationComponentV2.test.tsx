import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PaginationComponentV2 from '../../../../../components/common/queryable/pagination/PaginationComponentV2';
import { type QueryableHelpers } from '../../../../../components/common/queryable/QueryableHelpers';

vi.mock('../../../../../components/common/queryable/pagination/PaginationToolbar', () => ({ default: () => <div data-testid="toolbar" /> }));

const handleChangeTotalElements = vi.fn();
const handleChangePage = vi.fn();

const helpers = {
  paginationHelpers: {
    handleChangeTotalElements,
    handleChangePage,
  },
} as unknown as QueryableHelpers;

const input = {
  page: 0,
  size: 20,
};

const result = (pageNumber: number, totalPages: number) => ({
  data: {
    content: [{ id: 'row' }],
    totalElements: 7,
    totalPages,
    pageable: { pageNumber },
  },
});

describe('PaginationComponentV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('fetches with the search input and hands the rows and total over', async () => {
    // Arrange
    const fetch = vi.fn().mockResolvedValue(result(0, 1));
    const setContent = vi.fn();

    // Act
    render(<PaginationComponentV2 fetch={fetch} searchPaginationInput={input} setContent={setContent} queryableHelpers={helpers} />);

    // Assert
    await waitFor(() => expect(setContent).toHaveBeenCalledWith([{ id: 'row' }]));
    expect(fetch).toHaveBeenCalledWith(input);
    expect(handleChangeTotalElements).toHaveBeenCalledWith(7);
  });

  it('restarts from the first page when the fetched page is past the end', async () => {
    // Arrange
    const fetch = vi.fn().mockResolvedValue(result(3, 2));

    // Act
    render(<PaginationComponentV2 fetch={fetch} searchPaginationInput={input} setContent={vi.fn()} queryableHelpers={helpers} />);

    // Assert
    await waitFor(() => expect(handleChangePage).toHaveBeenCalledWith(0));
  });

  it('reports the loading state around the fetch', async () => {
    // Arrange
    const fetch = vi.fn().mockResolvedValue(result(0, 1));
    const setLoading = vi.fn();

    // Act
    render(<PaginationComponentV2 fetch={fetch} searchPaginationInput={input} setContent={vi.fn()} setLoading={setLoading} queryableHelpers={helpers} />);

    // Assert
    await waitFor(() => expect(setLoading).toHaveBeenLastCalledWith(false));
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
  });
});
