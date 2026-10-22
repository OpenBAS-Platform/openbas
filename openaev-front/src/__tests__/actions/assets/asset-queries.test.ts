import { QueryClient } from '@tanstack/react-query';
import { type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { assetKeys, assetListRefs, assetQueries, assetRefs, somethingCreated } from '../../../actions/assets/asset-queries';
import { fetchAssetOverview, fetchEndpointById, searchAssets } from '../../../actions/assets/endpoint-actions';
import { searchDistinctFindingsOnEndpoint } from '../../../actions/findings/finding-actions';
import { type Page } from '../../../components/common/queryable/Page';
import { type EndpointOutput, type SearchPaginationInput } from '../../../utils/api-types';

vi.mock('../../../actions/assets/endpoint-actions', () => ({
  fetchAssetOverview: vi.fn(),
  fetchEndpointById: vi.fn(),
  searchAssets: vi.fn(),
}));

vi.mock('../../../actions/findings/finding-actions', () => ({ searchDistinctFindingsOnEndpoint: vi.fn() }));

const input: SearchPaginationInput = {
  page: 0,
  size: 20,
};

const endpoint = (id: string, agentIds: string[], tags: string[] = [], groupIds: string[] = []) => ({
  asset_id: id,
  asset_agents: agentIds.map(agent_id => ({ agent_id })),
  asset_tags: tags,
  asset_asset_groups: groupIds.map(asset_group_id => ({ asset_group_id })),
}) as unknown as EndpointOutput;

const page = (content: EndpointOutput[]) => ({
  content,
  totalElements: content.length,
  totalPages: 1,
  pageable: { pageNumber: 0 },
}) as unknown as Page<EndpointOutput>;

const response = (data: unknown) => ({ data }) as AxiosResponse;

describe('assetKeys', () => {
  it('nests every key under the root', () => {
    // Arrange
    const keys = [assetKeys.lists(), assetKeys.list(input), assetKeys.details(), assetKeys.detail('a1')];

    // Act & Assert
    keys.forEach(key => expect(key[0]).toBe(assetKeys.all[0]));
  });

  it('puts the search input in the list key and the id in the detail key', () => {
    // Act & Assert
    expect(assetKeys.list(input)).toEqual(['assets', 'list', input]);
    expect(assetKeys.detail('a1')).toEqual(['assets', 'detail', 'a1']);
  });

  it('keeps sub-resources under their detail key', () => {
    // Act & Assert
    expect(assetKeys.findingsTotal('a1').slice(0, assetKeys.detail('a1').length)).toEqual(assetKeys.detail('a1'));
    expect(assetKeys.editable('a1').slice(0, assetKeys.detail('a1').length)).toEqual(assetKeys.detail('a1'));
  });

  it('gives different lists different keys', () => {
    // Act & Assert
    expect(assetKeys.list(input)).not.toEqual(assetKeys.list({
      ...input,
      page: 1,
    }));
  });
});

describe('assetRefs', () => {
  it('lists the asset and its agents', () => {
    // Act
    const refs = assetRefs(endpoint('a1', ['g1', 'g2']));

    // Assert
    expect(refs).toEqual([
      {
        type: 'assets',
        id: 'a1',
      },
      {
        type: 'agents',
        id: 'g1',
      },
      {
        type: 'agents',
        id: 'g2',
      },
    ]);
  });

  it('leaves the tags out, so a tag rename does not refetch the asset', () => {
    // Act
    const refs = assetRefs(endpoint('a1', [], ['t1', 't2']));

    // Assert
    expect(refs.some(ref => ref.type === 'tags')).toBe(false);
  });

  it('lists the asset groups shown on the detail', () => {
    // Act
    const refs = assetRefs(endpoint('a1', ['g1'], [], ['ag1', 'ag2']));

    // Assert
    expect(refs.map(ref => `${ref.type}:${ref.id}`)).toEqual(['assets:a1', 'agents:g1', 'asset_groups:ag1', 'asset_groups:ag2']);
  });

  it('copes with an asset without agents or asset groups', () => {
    // Act & Assert
    expect(assetRefs({ asset_id: 'a1' })).toEqual([{
      type: 'assets',
      id: 'a1',
    }]);
  });
});

describe('assetListRefs', () => {
  it('flattens the refs of every row of a page', () => {
    // Act
    const refs = assetListRefs(page([endpoint('a1', ['g1']), endpoint('a2', [], ['t1'])]));

    // Assert
    expect(refs.map(ref => `${ref.type}:${ref.id}`)).toEqual(['assets:a1', 'agents:g1', 'assets:a2']);
  });

  it('is empty for an empty page', () => {
    // Act & Assert
    expect(assetListRefs(page([]))).toEqual([]);
  });
});

describe('somethingCreated', () => {
  it('describes a creation of a type without an id', () => {
    // Act & Assert
    expect(somethingCreated('tags')).toEqual({
      type: 'tags',
      id: '',
      action: 'create',
    });
  });
});

describe('assetQueries live behaviour', () => {
  it('declares the rows of the list as refs and assets as a collection', () => {
    // Arrange
    const live = assetQueries.list(input).meta?.live;

    // Act
    const refs = live?.refs?.(page([endpoint('a1', ['g1'], ['t1'])]));

    // Assert
    expect(refs).toHaveLength(2);
    expect(live?.collections).toEqual(['assets']);
    expect(live?.throttleMs).toBe(3000);
  });

  it('declares the asset, its agents and its asset groups as refs of the detail, without collections', () => {
    // Arrange
    const live = assetQueries.detail('a1').meta?.live;

    // Act
    const refs = live?.refs?.(endpoint('a1', ['g1'], ['t1'], ['ag1']));

    // Assert
    expect(refs).toHaveLength(3);
    expect(live?.collections).toBeUndefined();
  });

  it('refreshes the findings counter when a finding is created or deleted, at most every 10 s', () => {
    // Arrange
    const live = assetQueries.findingsTotal('a1').meta?.live;

    // Act & Assert
    expect(live?.collections).toEqual(['findings']);
    expect(live?.throttleMs).toBe(10_000);
  });

  it('leaves the edit snapshot out of the live layer', () => {
    // Act & Assert
    expect(assetQueries.editable('a1').meta?.live).toBeUndefined();
  });
});

describe('assetQueries fetching', () => {
  const client = new QueryClient();

  beforeEach(() => {
    client.clear();
    vi.mocked(searchAssets).mockReset();
    vi.mocked(fetchAssetOverview).mockReset();
    vi.mocked(fetchEndpointById).mockReset();
    vi.mocked(searchDistinctFindingsOnEndpoint).mockReset();
  });

  it('unwraps the page of the list', async () => {
    // Arrange
    const result = page([endpoint('a1', [])]);
    vi.mocked(searchAssets).mockResolvedValue(response(result));

    // Act
    const data = await client.fetchQuery(assetQueries.list(input));

    // Assert
    expect(data).toBe(result);
    // Without its own toast: the query cache notifies once.
    expect(searchAssets).toHaveBeenCalledWith(input, false);
  });

  it('unwraps the asset of the detail', async () => {
    // Arrange
    const asset = endpoint('a1', []);
    vi.mocked(fetchAssetOverview).mockResolvedValue(response(asset));

    // Act
    const data = await client.fetchQuery(assetQueries.detail('a1'));

    // Assert
    expect(data).toBe(asset);
    expect(fetchAssetOverview).toHaveBeenCalledWith('a1', false);
  });

  it('reads only the total of a size-1 findings probe', async () => {
    // Arrange
    vi.mocked(searchDistinctFindingsOnEndpoint).mockResolvedValue(response({ totalElements: 7 }));

    // Act
    const total = await client.fetchQuery(assetQueries.findingsTotal('a1'));

    // Assert
    expect(total).toBe(7);
    expect(searchDistinctFindingsOnEndpoint).toHaveBeenCalledWith('a1', expect.objectContaining({ size: 1 }), false);
  });
});
