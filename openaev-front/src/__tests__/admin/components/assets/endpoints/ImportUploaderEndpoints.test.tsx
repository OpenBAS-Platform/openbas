import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { importEndpoints } from '../../../../../actions/assets/endpoint-actions';
import ImportUploaderEndpoints from '../../../../../admin/components/assets/endpoints/ImportUploaderEndpoints';

const { applyChanges, notifySuccess } = vi.hoisted(() => ({
  applyChanges: vi.fn(),
  notifySuccess: vi.fn(),
}));

const uploadSettled = vi.hoisted(() => ({ current: Promise.resolve() as Promise<unknown> }));

vi.mock('../../../../../actions/assets/endpoint-actions', () => ({
  importEndpoints: vi.fn(),
  searchAssets: vi.fn(),
  fetchAssetOverview: vi.fn(),
  fetchEndpointById: vi.fn(),
}));

vi.mock('../../../../../actions/findings/finding-actions', () => ({ searchDistinctFindingsOnEndpoint: vi.fn() }));

vi.mock('../../../../../utils/query/liveRouterContext', () => ({ useLiveRouter: () => ({ applyChanges }) }));

vi.mock('../../../../../utils/Environment', () => ({ MESSAGING$: { notifySuccess } }));

vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (value: string) => value }) }));

vi.mock('../../../../../components/common/ImportUploader', () => ({
  default: ({ handleUpload }: { handleUpload: (data: FormData, file: File) => void | Promise<void> }) => (
    <button
      type="button"
      data-testid="upload"
      onClick={() => {
        const settled = handleUpload(new FormData(), new File([''], 'endpoints.csv'));
        uploadSettled.current = Promise.resolve(settled);
      }}
    />
  ),
}));

const renderUploader = () => render(
  <QueryClientProvider client={new QueryClient()}>
    <ImportUploaderEndpoints />
  </QueryClientProvider>,
);

const response = (data: unknown) => ({ data }) as AxiosResponse;

describe('ImportUploaderEndpoints', () => {
  beforeEach(() => {
    applyChanges.mockReset();
    notifySuccess.mockReset();
    vi.mocked(importEndpoints).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('announces the creation of assets and tags without an id once the import succeeded', async () => {
    // Arrange
    vi.mocked(importEndpoints).mockResolvedValue(response({}));
    renderUploader();

    // Act
    fireEvent.click(screen.getByTestId('upload'));

    // Assert
    await waitFor(() => expect(applyChanges).toHaveBeenCalledTimes(1));
    expect(applyChanges.mock.calls[0][0]).toEqual([
      {
        type: 'assets',
        id: '',
        action: 'create',
      },
      {
        type: 'tags',
        id: '',
        action: 'create',
      },
    ]);
    expect(importEndpoints).toHaveBeenCalledWith(expect.any(FormData), 'ENDPOINTS');
  });

  it('keeps the upload pending until the import is done, then confirms it', async () => {
    // Arrange
    let finishImport: (value: AxiosResponse) => void = () => {};
    vi.mocked(importEndpoints).mockReturnValue(new Promise((resolve) => {
      finishImport = resolve;
    }));
    renderUploader();
    let settled = false;

    // Act
    fireEvent.click(screen.getByTestId('upload'));
    uploadSettled.current.then(() => {
      settled = true;
    });
    await waitFor(() => expect(importEndpoints).toHaveBeenCalled());

    // Assert
    expect(settled).toBe(false);
    expect(notifySuccess).not.toHaveBeenCalled();
    finishImport(response({}));
    await uploadSettled.current;
    expect(notifySuccess).toHaveBeenCalledWith('CSV imported successfully');
  });

  it('announces nothing when the import fails', async () => {
    // Arrange
    vi.mocked(importEndpoints).mockRejectedValue({ status: 500 });
    renderUploader();

    // Act
    fireEvent.click(screen.getByTestId('upload'));

    // Assert
    await waitFor(() => expect(importEndpoints).toHaveBeenCalled());
    await uploadSettled.current;
    expect(applyChanges).not.toHaveBeenCalled();
    expect(notifySuccess).not.toHaveBeenCalled();
  });
});
