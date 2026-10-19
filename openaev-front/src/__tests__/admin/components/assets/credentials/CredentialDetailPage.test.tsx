import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const CREDENTIAL_ID = 'credential-1';

const credential = (name: string) => ({
  credential_id: CREDENTIAL_ID,
  credential_name: name,
  credential_type: 'IDENTITY',
  credential_auth_method: 'USERNAME_PASSWORD',
});

const fetchCredentialMock = vi.fn<(credentialId: string, notifyError?: boolean) => Promise<unknown>>();
let liveUpdates = false;

vi.mock('../../../../../actions/assets/credential-actions', () => ({ fetchCredential: fetchCredentialMock }));
vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../utils/error/errorHandlerUtil', () => ({ notifyErrorHandler: vi.fn() }));
vi.mock('../../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    fldt: (s: string) => s,
  }),
}));
vi.mock('../../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../../components/ItemTags', () => ({ default: () => null }));
vi.mock('../../../../../components/ExpandableMarkdown', () => ({ default: () => null }));
vi.mock('../../../../../components/Loader', () => ({ default: () => <div role="progressbar" /> }));
vi.mock('../../../../../components/NotFound', () => ({ default: () => <div role="alert" aria-label="not found" /> }));
vi.mock('../../../../../components/common/detail/EntityDetailCommon', () => ({
  DetailHero: ({ title }: { title: string }) => <h1>{title}</h1>,
  DetailSections: () => null,
  InformationGrid: () => null,
  Field: () => null,
}));
vi.mock('../../../../../admin/components/assets/credentials/CredentialPopover', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: CredentialDetailPage } = await import('../../../../../admin/components/assets/credentials/CredentialDetailPage');

const renderDetail = () => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={[`/admin/credentials/${CREDENTIAL_ID}`]}>
      <Routes>
        <Route path="/admin/credentials/:credentialId/*" element={<CredentialDetailPage />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>,
);

const invalidateCredentialTopic = () => act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`credential:${CREDENTIAL_ID}`) }));

describe('CredentialDetailPage', () => {
  beforeEach(() => {
    fetchCredentialMock.mockResolvedValue({ data: credential('First') });
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the credential once, outside the query cache', async () => {
      // Act
      renderDetail();

      // Assert
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      expect(fetchCredentialMock).toHaveBeenCalledTimes(1);
      expect(fetchCredentialMock).toHaveBeenCalledWith(CREDENTIAL_ID);
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdateCount === 0)).toBe(true);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('refetches the credential when its topic is invalidated', async () => {
      // Arrange
      renderDetail();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      fetchCredentialMock.mockResolvedValue({ data: credential('Renamed') });

      // Act
      await invalidateCredentialTopic();

      // Assert
      expect(await screen.findByRole('heading', { name: 'Renamed' })).toBeDefined();
      expect(fetchCredentialMock).toHaveBeenLastCalledWith(CREDENTIAL_ID, false);
    });

    it('shows the not found page when the credential disappears, without retrying', async () => {
      // Arrange
      renderDetail();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      fetchCredentialMock.mockRejectedValue(Object.assign(new Error('Not found'), { status: 404 }));

      // Act
      await invalidateCredentialTopic();

      // Assert
      expect(await screen.findByRole('alert', { name: 'not found' })).toBeDefined();
      await waitFor(() => expect(fetchCredentialMock).toHaveBeenCalledTimes(2));
    });
  });
});
