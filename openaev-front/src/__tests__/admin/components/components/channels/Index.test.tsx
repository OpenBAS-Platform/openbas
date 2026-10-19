import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const CHANNEL_ID = 'channel-1';

let storedChannel: {
  channel_id: string;
  channel_name: string;
} | undefined;
const fetchChannelMock = vi.fn<(channelId: string) => unknown>();
let liveUpdates = false;

vi.mock('../../../../../actions/channels/channel-action', () => ({ fetchChannel: fetchChannelMock }));
vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../store', () => ({ useHelper: () => ({ channel: storedChannel }) }));
// The dispatched value is what the mocked fetch action returned.
vi.mock('../../../../../utils/hooks', () => ({ useAppDispatch: () => (action: unknown) => action }));
vi.mock('../../../../../utils/hooks/useDataLoader', () => ({
  default: (load: () => void) => {
    useEffect(() => {
      load();
    }, []);
  },
}));
vi.mock('../../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../../components/Loader', () => ({ default: () => <div role="progressbar" /> }));
vi.mock('../../../../../components/NotFound', () => ({ default: () => <div role="alert" aria-label="not found" /> }));
vi.mock('../../../../../admin/components/components/channels/ChannelHeader', () => ({ default: () => <h1>{storedChannel?.channel_name}</h1> }));
vi.mock('../../../../../admin/components/components/channels/Channel', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: ChannelIndex } = await import('../../../../../admin/components/components/channels/Index');

const renderChannel = () => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={[`/admin/components/channels/${CHANNEL_ID}`]}>
      <Routes>
        <Route path="/admin/components/channels/:channelId/*" element={<ChannelIndex />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>,
);

const invalidateComponentsTopic = () => act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic('list:components') }));

describe('Channel detail', () => {
  beforeEach(() => {
    storedChannel = {
      channel_id: CHANNEL_ID,
      channel_name: 'First',
    };
    fetchChannelMock.mockReturnValue(Promise.resolve());
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

    it('loads the channel through the data loader only', async () => {
      // Act
      renderChannel();

      // Assert
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      expect(fetchChannelMock).toHaveBeenCalledTimes(1);
      // Disabled queries register in the cache but never run.
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdateCount === 0)).toBe(true);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('reloads the channel when the components topic is invalidated', async () => {
      // Arrange
      renderChannel();
      await waitFor(() => expect(fetchChannelMock).toHaveBeenCalledTimes(1));

      // Act
      await invalidateComponentsTopic();

      // Assert
      await waitFor(() => expect(fetchChannelMock).toHaveBeenCalledTimes(2));
    });

    it('shows the not found page when the channel disappears', async () => {
      // Arrange
      renderChannel();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      fetchChannelMock.mockReturnValue(Promise.reject(Object.assign(new Error('Not found'), { status: 404 })));

      // Act
      await invalidateComponentsTopic();

      // Assert
      expect(await screen.findByRole('alert', { name: 'not found' })).toBeDefined();
    });
  });
});
