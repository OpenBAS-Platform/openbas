import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { useContext, useState } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CustomDashboardContext } from '../../../../../admin/components/workspaces/custom_dashboards/CustomDashboardContext';
import { type CustomDashboard } from '../../../../../utils/api-types';
import { dashboardKey } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

let liveUpdates = false;

vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
// Plain state instead of persistence: Node's non-functional localStorage global shadows the
// happy-dom one, breaking the real hook in tests.
vi.mock('usehooks-ts', () => ({ useLocalStorage: (_key: string, initialValue: unknown) => useState(initialValue) }));
vi.mock('../../../../../components/Loader', () => ({ default: () => <div data-testid="dashboard-loader" /> }));

// Shows what the dashboard component reads from the context, and lets a test add a widget locally.
const DashboardProbe = () => {
  const { customDashboard, setCustomDashboard } = useContext(CustomDashboardContext);
  if (!customDashboard) {
    return <div data-testid="no-dashboard" />;
  }
  return (
    <>
      <div data-testid="dashboard-name">{customDashboard.custom_dashboard_name}</div>
      <div data-testid="widget-count">{customDashboard.custom_dashboard_widgets?.length ?? 0}</div>
      <button
        type="button"
        aria-label="add widget"
        onClick={() => setCustomDashboard(previous => previous && ({
          ...previous,
          custom_dashboard_widgets: [...(previous.custom_dashboard_widgets ?? []), { widget_id: 'widget-new' } as never],
        }))}
      />
    </>
  );
};
vi.mock('../../../../../admin/components/workspaces/custom_dashboards/CustomDashboardComponent', () => ({ default: () => <DashboardProbe /> }));

// Imported after the mocks so the wrapper picks them up.
const { default: CustomDashboardWrapper } = await import('../../../../../admin/components/workspaces/custom_dashboards/CustomDashboardWrapper');

const DASHBOARD_ID = 'dashboard-1';

const dashboard = (name: string): CustomDashboard => ({
  custom_dashboard_id: DASHBOARD_ID,
  custom_dashboard_name: name,
  custom_dashboard_widgets: [],
  custom_dashboard_parameters: [],
  custom_dashboard_created_at: '2026-01-01T00:00:00Z',
  custom_dashboard_updated_at: '2026-01-01T00:00:00Z',
  listened: false,
}) as unknown as CustomDashboard;

const wrapperTree = (fetchCustomDashboard: () => Promise<{ data: CustomDashboard }>) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <CustomDashboardWrapper
        configuration={{
          customDashboardId: DASHBOARD_ID,
          paramLocalStorageKey: 'custom-dashboard-test',
          fetchCustomDashboard: fetchCustomDashboard as never,
          fetchCount: vi.fn(),
          fetchAverage: vi.fn(),
          fetchSeries: vi.fn(),
          fetchEntities: vi.fn(),
          fetchEntitiesRuntime: vi.fn(),
          fetchAttackPaths: vi.fn(),
        }}
      />
    </MemoryRouter>
  </QueryClientProvider>
);
const renderWrapper = (fetchCustomDashboard: () => Promise<{ data: CustomDashboard }>) => render(wrapperTree(fetchCustomDashboard));

// The wrapper keeps its loader for a minimum time to avoid blinking.
const LOADED = { timeout: 3000 };

describe('CustomDashboardWrapper', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('with live updates on', () => {
    it('refetches the definition when the dashboard key is invalidated', async () => {
      // Arrange
      liveUpdates = true;
      const fetchCustomDashboard = vi.fn()
        .mockResolvedValueOnce({ data: dashboard('Before') })
        .mockResolvedValueOnce({ data: dashboard('After') });
      renderWrapper(fetchCustomDashboard);
      expect((await screen.findByTestId('dashboard-name', undefined, LOADED)).textContent).toBe('Before');

      // Act: the topic 'dashboard:<id>' fires
      await act(async () => {
        await queryClient.invalidateQueries({ queryKey: dashboardKey(DASHBOARD_ID) });
      });

      // Assert
      expect(fetchCustomDashboard).toHaveBeenCalledTimes(2);
      await waitFor(() => expect(screen.getByTestId('dashboard-name').textContent).toBe('After'));
    });

    it('keeps the dashboard on screen when the surface hands a new fetch function', async () => {
      // Arrange
      liveUpdates = true;
      const fetchCustomDashboard = vi.fn().mockResolvedValue({ data: dashboard('Board') });
      const { rerender } = renderWrapper(fetchCustomDashboard);
      await screen.findByTestId('dashboard-name', undefined, LOADED);

      // Act: the home page builds its configuration on every render
      await act(async () => {
        rerender(wrapperTree(() => fetchCustomDashboard()));
      });

      // Assert
      expect(screen.queryByTestId('dashboard-loader')).toBeNull();
      expect(screen.getByTestId('dashboard-name').textContent).toBe('Board');
      expect(fetchCustomDashboard).toHaveBeenCalledTimes(1);
    });

    it('writes a local widget change to the cached definition', async () => {
      // Arrange
      liveUpdates = true;
      renderWrapper(vi.fn().mockResolvedValue({ data: dashboard('Board') }));
      await screen.findByTestId('dashboard-name', undefined, LOADED);

      // Act
      await act(async () => {
        screen.getByRole('button', { name: 'add widget' }).click();
      });

      // Assert
      await waitFor(() => expect(screen.getByTestId('widget-count').textContent).toBe('1'));
      const [cached] = queryClient.getQueryCache().findAll({ queryKey: dashboardKey(DASHBOARD_ID) });
      expect((cached.state.data as CustomDashboard).custom_dashboard_widgets).toHaveLength(1);
    });

    it('shows the dashboard as unavailable once its definition answers 404', async () => {
      // Arrange
      liveUpdates = true;
      const fetchCustomDashboard = vi.fn()
        .mockResolvedValueOnce({ data: dashboard('Board') })
        .mockRejectedValueOnce({ status: 404 });
      renderWrapper(fetchCustomDashboard);
      await screen.findByTestId('dashboard-name', undefined, LOADED);

      // Act: deleted by another user
      await act(async () => {
        await queryClient.invalidateQueries({ queryKey: dashboardKey(DASHBOARD_ID) });
      });

      // Assert: the dashboard component then renders its no-dashboard slot
      expect(await screen.findByTestId('no-dashboard')).toBeDefined();
    });
  });

  describe('with live updates off', () => {
    it('loads the definition once, outside the query cache', async () => {
      // Arrange
      liveUpdates = false;
      const fetchCustomDashboard = vi.fn().mockResolvedValue({ data: dashboard('Board') });
      renderWrapper(fetchCustomDashboard);
      await screen.findByTestId('dashboard-name', undefined, LOADED);

      // Act
      await act(async () => {
        await queryClient.invalidateQueries({ queryKey: dashboardKey(DASHBOARD_ID) });
      });

      // Assert
      expect(fetchCustomDashboard).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryCache().findAll({ queryKey: dashboardKey(DASHBOARD_ID) })
        .every(query => query.state.data === undefined)).toBe(true);
    });
  });
});
