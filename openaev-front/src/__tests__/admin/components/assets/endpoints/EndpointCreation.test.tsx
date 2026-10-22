import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAiTargetCall } from '../../../../../actions/assets/aiTarget-actions';
import { createEndpointAgentlessCall } from '../../../../../actions/assets/endpoint-actions';
import EndpointCreation from '../../../../../admin/components/assets/endpoints/EndpointCreation';

const { applyChanges } = vi.hoisted(() => ({ applyChanges: vi.fn() }));

vi.mock('../../../../../actions/assets/aiTarget-actions', () => ({ createAiTargetCall: vi.fn() }));

vi.mock('../../../../../actions/assets/endpoint-actions', () => ({
  createEndpointAgentlessCall: vi.fn(),
  searchAssets: vi.fn(),
  fetchAssetOverview: vi.fn(),
  fetchEndpointById: vi.fn(),
}));

vi.mock('../../../../../actions/findings/finding-actions', () => ({ searchDistinctFindingsOnEndpoint: vi.fn() }));

vi.mock('../../../../../utils/query/liveRouterContext', () => ({ useLiveRouter: () => ({ applyChanges }) }));

vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (value: string) => value }) }));

vi.mock('../../../../../components/common/ButtonCreate', () => ({ default: ({ onClick }: { onClick: () => void }) => <button type="button" data-testid="create" onClick={onClick} /> }));

vi.mock('../../../../../components/common/Drawer', () => ({
  default: ({ open, children }: {
    open: boolean;
    children: React.ReactNode;
  }) => (open ? <div>{children}</div> : null),
}));

vi.mock('../../../../../admin/components/assets/AssetCategoryPicker', () => ({
  default: ({ onSelect }: { onSelect: (category: string) => void }) => (
    <>
      <button type="button" data-testid="pick-host" onClick={() => onSelect('HOST')} />
      <button type="button" data-testid="pick-ai-target" onClick={() => onSelect('AI_TARGET')} />
    </>
  ),
}));

vi.mock('../../../../../admin/components/assets/AssetForm', () => ({ default: ({ onSubmit }: { onSubmit: (data: unknown) => void }) => <button type="button" data-testid="submit-endpoint" onClick={() => onSubmit({ asset_name: 'host' })} /> }));

vi.mock('../../../../../admin/components/assets/ai_targets/AiTargetForm', () => ({ default: ({ onSubmit }: { onSubmit: (data: unknown) => void }) => <button type="button" data-testid="submit-ai-target" onClick={() => onSubmit({ asset_name: 'ai' })} /> }));

const renderCreation = () => render(
  <QueryClientProvider client={new QueryClient()}>
    <EndpointCreation />
  </QueryClientProvider>,
);

const response = (data: unknown) => ({ data }) as AxiosResponse;

describe('EndpointCreation', () => {
  beforeEach(() => {
    applyChanges.mockReset();
    vi.mocked(createEndpointAgentlessCall).mockReset();
    vi.mocked(createAiTargetCall).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('announces the created agentless endpoint', async () => {
    // Arrange
    vi.mocked(createEndpointAgentlessCall).mockResolvedValue(response({ asset_id: 'new-endpoint' }));
    renderCreation();

    // Act
    fireEvent.click(screen.getByTestId('create'));
    fireEvent.click(screen.getByTestId('pick-host'));
    fireEvent.click(screen.getByTestId('submit-endpoint'));

    // Assert
    await waitFor(() => expect(applyChanges).toHaveBeenCalledTimes(1));
    expect(applyChanges.mock.calls[0][0]).toEqual([{
      type: 'assets',
      id: 'new-endpoint',
      action: 'create',
    }]);
  });

  it('announces the created AI target as an asset', async () => {
    // Arrange
    vi.mocked(createAiTargetCall).mockResolvedValue(response({ asset_id: 'new-ai-target' }));
    renderCreation();

    // Act
    fireEvent.click(screen.getByTestId('create'));
    fireEvent.click(screen.getByTestId('pick-ai-target'));
    fireEvent.click(screen.getByTestId('submit-ai-target'));

    // Assert
    await waitFor(() => expect(applyChanges).toHaveBeenCalledTimes(1));
    expect(applyChanges.mock.calls[0][0]).toEqual([{
      type: 'assets',
      id: 'new-ai-target',
      action: 'create',
    }]);
  });

  it('announces nothing when the creation fails', async () => {
    // Arrange
    vi.mocked(createEndpointAgentlessCall).mockRejectedValue({ status: 400 });
    renderCreation();

    // Act
    fireEvent.click(screen.getByTestId('create'));
    fireEvent.click(screen.getByTestId('pick-host'));
    fireEvent.click(screen.getByTestId('submit-endpoint'));

    // Assert
    await waitFor(() => expect(createEndpointAgentlessCall).toHaveBeenCalled());
    expect(applyChanges).not.toHaveBeenCalled();
  });
});
