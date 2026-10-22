import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchAiTargetById, updateAiTargetCall, updateAiTargetMarkingsCall } from '../../../../../actions/assets/aiTarget-actions';
import { deleteAsset } from '../../../../../actions/assets/endpoint-actions';
import AssetPopover, { type AssetPopoverProps } from '../../../../../admin/components/assets/endpoints/AssetPopover';

const { applyChanges } = vi.hoisted(() => ({ applyChanges: vi.fn() }));

vi.mock('../../../../../actions/asset_groups/assetgroup-action', () => ({ updateAssetsOnAssetGroup: vi.fn() }));

vi.mock('../../../../../actions/assets/aiTarget-actions', () => ({
  fetchAiTargetById: vi.fn(),
  updateAiTargetCall: vi.fn(),
  updateAiTargetMarkingsCall: vi.fn(),
}));

vi.mock('../../../../../actions/assets/endpoint-actions', () => ({
  deleteAsset: vi.fn(),
  searchAssets: vi.fn(),
  fetchAssetOverview: vi.fn(),
  fetchEndpointById: vi.fn(),
}));

vi.mock('../../../../../actions/findings/finding-actions', () => ({ searchDistinctFindingsOnEndpoint: vi.fn() }));

vi.mock('../../../../../utils/query/liveRouterContext', () => ({ useLiveRouter: () => ({ applyChanges }) }));

vi.mock('../../../../../utils/hooks', () => ({ useAppDispatch: () => vi.fn() }));

vi.mock('../../../../../utils/permissions/permissionsContext', () => ({ useAbility: () => ({ can: () => true }) }));

vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (value: string) => value }) }));

vi.mock('../../../../../components/Loader', () => ({ default: () => <div data-testid="loading" /> }));

vi.mock('../../../../../components/common/Drawer', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

vi.mock('../../../../../components/common/ButtonPopover', () => ({
  default: ({ entries }: {
    entries: {
      label: string;
      action: () => void;
    }[];
  }) => (
    <>
      {entries.map(entry => <button key={entry.label} type="button" onClick={entry.action}>{entry.label}</button>)}
    </>
  ),
}));

vi.mock('../../../../../components/common/DialogDelete', () => ({
  default: ({ open, handleSubmit, text }: {
    open: boolean;
    handleSubmit: () => void;
    text: string;
  }) => (
    open ? <button type="button" onClick={handleSubmit}>{`confirm: ${text}`}</button> : null
  ),
}));

vi.mock('../../../../../admin/components/assets/endpoints/EndpointUpdate', () => ({ default: () => <div data-testid="endpoint-update" /> }));

vi.mock('../../../../../admin/components/assets/ai_targets/AiTargetForm', () => ({
  default: ({ onSubmit, onMarkingsChange }: {
    onSubmit: (data: unknown) => void;
    onMarkingsChange: (ids: string[]) => void;
  }) => (
    <>
      <button type="button" data-testid="submit-ai-target" onClick={() => onSubmit({ asset_name: 'ai' })} />
      <button type="button" data-testid="markings-ai-target" onClick={() => onMarkingsChange(['m1'])} />
    </>
  ),
}));

const endpoint = (category?: string) => ({
  asset_id: 'a1',
  asset_name: 'Asset one',
  asset_category: category,
}) as AssetPopoverProps['endpoint'];

const renderPopover = (props: Partial<AssetPopoverProps> = {}) => render(
  <QueryClientProvider client={new QueryClient()}>
    <AssetPopover endpoint={endpoint()} updatable deletable {...props} />
  </QueryClientProvider>,
);

const response = (data: unknown) => ({ data }) as AxiosResponse;

describe('AssetPopover', () => {
  beforeEach(() => {
    applyChanges.mockReset();
    vi.mocked(deleteAsset).mockReset();
    vi.mocked(fetchAiTargetById).mockReset().mockResolvedValue(response({ asset_name: 'ai' }));
    vi.mocked(updateAiTargetCall).mockReset();
    vi.mocked(updateAiTargetMarkingsCall).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('announces the deletion of the asset once confirmed', async () => {
    // Arrange
    vi.mocked(deleteAsset).mockResolvedValue(response({}));
    const onDelete = vi.fn();
    renderPopover({ onDelete });

    // Act
    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('confirm: Do you want to delete the asset: Asset one?'));

    // Assert
    await waitFor(() => expect(applyChanges).toHaveBeenCalledTimes(1));
    expect(applyChanges.mock.calls[0][0]).toEqual([{
      type: 'assets',
      id: 'a1',
      action: 'delete',
    }]);
    expect(onDelete).toHaveBeenCalledWith('a1');
  });

  it('hands the update to the host instead of opening the drawer when it takes over', () => {
    // Arrange
    const onRequestUpdate = vi.fn();
    renderPopover({ onRequestUpdate });

    // Act
    fireEvent.click(screen.getByText('Update'));

    // Assert
    expect(onRequestUpdate).toHaveBeenCalledWith(expect.objectContaining({ asset_id: 'a1' }));
    expect(screen.queryByTestId('endpoint-update')).not.toBeInTheDocument();
  });

  it('hands the deletion to the host instead of opening the dialog when it takes over', () => {
    // Arrange
    const onRequestDelete = vi.fn();
    renderPopover({ onRequestDelete });

    // Act
    fireEvent.click(screen.getByText('Delete'));

    // Assert
    expect(onRequestDelete).toHaveBeenCalledWith(expect.objectContaining({ asset_id: 'a1' }));
    expect(screen.queryByText('confirm: Do you want to delete the asset: Asset one?')).not.toBeInTheDocument();
  });

  it('announces nothing when the deletion fails', async () => {
    // Arrange
    vi.mocked(deleteAsset).mockRejectedValue({ status: 403 });
    renderPopover();

    // Act
    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('confirm: Do you want to delete the asset: Asset one?'));

    // Assert
    await waitFor(() => expect(deleteAsset).toHaveBeenCalledWith('a1'));
    expect(applyChanges).not.toHaveBeenCalled();
  });

  it('announces the update of an AI target once saved', async () => {
    // Arrange
    vi.mocked(updateAiTargetCall).mockResolvedValue(response({ asset_id: 'a1' }));
    renderPopover({ endpoint: endpoint('AI_TARGET') });

    // Act
    fireEvent.click(screen.getByText('Update'));
    fireEvent.click(await screen.findByTestId('submit-ai-target'));

    // Assert
    await waitFor(() => expect(applyChanges).toHaveBeenCalledTimes(1));
    expect(applyChanges.mock.calls[0][0]).toEqual([{
      type: 'assets',
      id: 'a1',
      action: 'update',
    }]);
  });

  it('announces the update of an AI target once its markings are saved', async () => {
    // Arrange
    vi.mocked(updateAiTargetMarkingsCall).mockResolvedValue(response({ asset_id: 'a1' }));
    renderPopover({ endpoint: endpoint('AI_TARGET') });

    // Act
    fireEvent.click(screen.getByText('Update'));
    fireEvent.click(await screen.findByTestId('markings-ai-target'));

    // Assert
    await waitFor(() => expect(applyChanges).toHaveBeenCalledTimes(1));
    expect(applyChanges.mock.calls[0][0]).toEqual([{
      type: 'assets',
      id: 'a1',
      action: 'update',
    }]);
  });
});
