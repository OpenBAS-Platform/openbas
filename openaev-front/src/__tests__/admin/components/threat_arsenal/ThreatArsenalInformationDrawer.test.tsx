import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type ThreatArsenalAction, type ThreatArsenalActionFullOutput } from '../../../../utils/api-types';
import { keyOfTopic, PAYLOADS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

const ACTION_ID = '7a4b4c2e-1111-4222-8333-944445555666';

const fetchThreatArsenalActionMock = vi.fn<(actionId: string, notifyError?: boolean) => Promise<{ data: ThreatArsenalActionFullOutput }>>();
let liveUpdates = false;

const details = (description: string) => ({ data: { action_description: description } as ThreatArsenalActionFullOutput });

vi.mock('../../../../actions/threat_arsenals/threatArsenal-actions', () => ({ fetchThreatArsenalAction: fetchThreatArsenalActionMock }));
vi.mock('../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../utils/error/errorHandlerUtil', () => ({ notifyErrorHandler: vi.fn() }));
vi.mock('../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../components/common/Drawer', () => ({ default: ({ children }: { children: ReactElement }) => children }));
vi.mock('../../../../admin/components/threat_arsenal/ThreatArsenalActionOverview', () => ({
  default: ({ loading, payload }: {
    loading: boolean;
    payload: { payload_description?: string } | null;
  }) => <div>{loading ? 'loading' : payload?.payload_description}</div>,
}));

// Imported after the mocks so the drawer picks them up.
const { default: ThreatArsenalInformationDrawer } = await import('../../../../admin/components/threat_arsenal/ThreatArsenalInformationDrawer');

const action = {
  injector_contract_id: ACTION_ID,
  action_payload: { payload_id: 'payload-1' },
} as unknown as ThreatArsenalAction;

const renderDrawer = () => render(
  <QueryClientProvider client={queryClient}>
    <ThreatArsenalInformationDrawer open onClose={vi.fn()} threatArsenalAction={action} />
  </QueryClientProvider>,
);

describe('ThreatArsenalInformationDrawer', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('loads the details once with live updates off', async () => {
    // Arrange
    liveUpdates = false;
    fetchThreatArsenalActionMock.mockResolvedValue(details('first'));

    // Act
    renderDrawer();

    // Assert
    expect(await screen.findByText('first')).toBeDefined();
    expect(fetchThreatArsenalActionMock).toHaveBeenCalledWith(ACTION_ID);
    await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`payload:${ACTION_ID}`) }));
    expect(fetchThreatArsenalActionMock).toHaveBeenCalledTimes(1);
  });

  describe('with live updates on', () => {
    it('refetches the details when the action topic is invalidated, not on the list topic', async () => {
      // Arrange
      liveUpdates = true;
      fetchThreatArsenalActionMock
        .mockResolvedValueOnce(details('first'))
        .mockResolvedValueOnce(details('second'));
      renderDrawer();
      expect(await screen.findByText('first')).toBeDefined();
      expect(fetchThreatArsenalActionMock).toHaveBeenCalledWith(ACTION_ID, false);

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: PAYLOADS_LIST_KEY }));
      expect(fetchThreatArsenalActionMock).toHaveBeenCalledTimes(1);
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`payload:${ACTION_ID}`) }));

      // Assert
      expect(await screen.findByText('second')).toBeDefined();
      expect(fetchThreatArsenalActionMock).toHaveBeenCalledTimes(2);
    });

    it('shows the action as unavailable after a client error, without retrying', async () => {
      // Arrange
      liveUpdates = true;
      fetchThreatArsenalActionMock
        .mockResolvedValueOnce(details('first'))
        .mockRejectedValueOnce({ status: 404 });
      renderDrawer();
      expect(await screen.findByText('first')).toBeDefined();

      // Act: the action is deleted while the drawer is open.
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`payload:${ACTION_ID}`) }));

      // Assert
      expect(await screen.findByText('Action is currently unavailable or you do not have sufficient permissions to access it.')).toBeDefined();
      await waitFor(() => expect(fetchThreatArsenalActionMock).toHaveBeenCalledTimes(2));
    });
  });
});
