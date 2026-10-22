import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchEndpointById, updateAssetMarkingsCall, updateEndpointCall } from '../../../../../actions/assets/endpoint-actions';
import EndpointUpdate from '../../../../../admin/components/assets/endpoints/EndpointUpdate';

const { applyChanges } = vi.hoisted(() => ({ applyChanges: vi.fn() }));

vi.mock('../../../../../actions/assets/endpoint-actions', () => ({
  fetchEndpointById: vi.fn(),
  updateEndpointCall: vi.fn(),
  updateAssetMarkingsCall: vi.fn(),
  searchAssets: vi.fn(),
  fetchAssetOverview: vi.fn(),
}));

vi.mock('../../../../../actions/findings/finding-actions', () => ({ searchDistinctFindingsOnEndpoint: vi.fn() }));

vi.mock('../../../../../utils/query/liveRouterContext', () => ({ useLiveRouter: () => ({ applyChanges }) }));

vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (value: string) => value }) }));

vi.mock('../../../../../components/Loader', () => ({ default: () => <div data-testid="loading" /> }));

vi.mock('../../../../../components/common/Drawer', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

vi.mock('../../../../../admin/components/assets/AssetForm', () => ({
  default: ({ onSubmit, onMarkingsChange }: {
    onSubmit: (data: unknown) => void;
    onMarkingsChange: (ids: string[]) => void;
  }) => (
    <>
      <button type="button" data-testid="submit" onClick={() => onSubmit({ asset_name: 'renamed' })} />
      <button type="button" data-testid="markings" onClick={() => onMarkingsChange(['m1'])} />
    </>
  ),
}));

const renderUpdate = () => render(
  <QueryClientProvider client={new QueryClient()}>
    <EndpointUpdate open handleClose={vi.fn()} endpointId="a1" />
  </QueryClientProvider>,
);

const response = (data: unknown) => ({ data }) as AxiosResponse;

describe('EndpointUpdate', () => {
  beforeEach(() => {
    applyChanges.mockReset();
    vi.mocked(fetchEndpointById).mockReset().mockResolvedValue(response({ asset_id: 'a1' }));
    vi.mocked(updateEndpointCall).mockReset();
    vi.mocked(updateAssetMarkingsCall).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('announces the update of the asset once saved', async () => {
    // Arrange
    vi.mocked(updateEndpointCall).mockResolvedValue(response({ asset_id: 'a1' }));
    renderUpdate();

    // Act
    fireEvent.click(await screen.findByTestId('submit'));

    // Assert
    await waitFor(() => expect(applyChanges).toHaveBeenCalledTimes(1));
    expect(applyChanges.mock.calls[0][0]).toEqual([{
      type: 'assets',
      id: 'a1',
      action: 'update',
    }]);
  });

  it('announces the update of the asset once its markings are saved', async () => {
    // Arrange
    vi.mocked(updateAssetMarkingsCall).mockResolvedValue(response({ asset_id: 'a1' }));
    renderUpdate();

    // Act
    fireEvent.click(await screen.findByTestId('markings'));

    // Assert
    await waitFor(() => expect(applyChanges).toHaveBeenCalledTimes(1));
    expect(applyChanges.mock.calls[0][0]).toEqual([{
      type: 'assets',
      id: 'a1',
      action: 'update',
    }]);
  });

  it('announces nothing when the save fails', async () => {
    // Arrange
    vi.mocked(updateEndpointCall).mockRejectedValue({ status: 400 });
    renderUpdate();

    // Act
    fireEvent.click(await screen.findByTestId('submit'));

    // Assert
    await waitFor(() => expect(updateEndpointCall).toHaveBeenCalled());
    expect(applyChanges).not.toHaveBeenCalled();
  });
});
