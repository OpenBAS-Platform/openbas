import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type AxiosResponse } from 'axios';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { listTags } from '../../../actions/tags/tag-action';
import { tagQueries, useTagsMap } from '../../../actions/tags/tag-queries';
import { type Tag } from '../../../utils/api-types';

vi.mock('../../../actions/tags/tag-action', () => ({ listTags: vi.fn() }));

const tags = [
  {
    tag_id: 't1',
    tag_name: 'First',
  },
  {
    tag_id: 't2',
    tag_name: 'Second',
  },
] as Tag[];

describe('tag queries', () => {
  it('indexes the tags by id once loaded', async () => {
    // Arrange
    vi.mocked(listTags).mockResolvedValue({ data: tags } as AxiosResponse);
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;

    // Act
    const { result } = renderHook(() => useTagsMap(), { wrapper });

    // Assert
    expect(result.current).toEqual({});
    await waitFor(() => expect(result.current.t2?.tag_name).toBe('Second'));
    expect(Object.keys(result.current)).toEqual(['t1', 't2']);
  });

  it('refreshes the list when a tag changes or is created', () => {
    // Arrange
    const live = tagQueries.list().meta?.live;

    // Act & Assert
    expect(live?.refs?.(tags)).toEqual([
      {
        type: 'tags',
        id: 't1',
      },
      {
        type: 'tags',
        id: 't2',
      },
    ]);
    expect(live?.collections).toEqual(['tags']);
  });
});
