import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CustomDashboardContext, type CustomDashboardContextType } from '../../../../../../admin/components/workspaces/custom_dashboards/CustomDashboardContext';
import { widgetScopeKey } from '../../../../../../admin/components/workspaces/custom_dashboards/dashboardQueries';
import { type Widget } from '../../../../../../utils/api-types';
import { ANALYTICS_KEY } from '../../../../../../utils/query/keys';
import queryClient from '../../../../../../utils/query/queryClient';

vi.mock('../../../../../../components/Loader', () => ({ default: () => <div data-testid="widget-loader" /> }));
vi.mock('../../../../../../admin/components/workspaces/custom_dashboards/widgets/WidgetTitle', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/workspaces/custom_dashboards/widgets/WidgetViz', () => ({ default: ({ vizData }: { vizData: { data?: { value?: number } } }) => <div data-testid="widget-value">{vizData.data?.value ?? 'none'}</div> }));

// Imported after the mocks so the widget picks them up.
const { default: WidgetWrapper } = await import('../../../../../../admin/components/workspaces/custom_dashboards/widgets/WidgetWrapper');

const WIDGET = {
  widget_id: 'widget-1',
  widget_type: 'number',
  widget_config: {
    title: 'Findings',
    widget_configuration_type: 'flat',
  },
} as unknown as Widget;

const deferred = <T,>() => {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return {
    promise,
    resolve,
  };
};

const renderWidget = (fetchCount: CustomDashboardContextType['fetchCount'], widgetQueryScope?: readonly unknown[]) => {
  const context = {
    customDashboard: undefined,
    setCustomDashboard: vi.fn(),
    customDashboardParameters: {},
    setCustomDashboardParameters: vi.fn(),
    fetchCount,
    fetchAverage: vi.fn(),
    fetchSeries: vi.fn(),
    fetchEntities: vi.fn(),
    fetchEntitiesRuntime: vi.fn(),
    fetchAttackPaths: vi.fn(),
    openWidgetResults: vi.fn(),
    setGridReady: vi.fn(),
    widgetQueryScope,
  } as unknown as CustomDashboardContextType;
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={createTheme()}>
        <CustomDashboardContext.Provider value={context}>
          <WidgetWrapper
            widget={WIDGET}
            fullscreen={false}
            setFullscreen={vi.fn()}
            idToResize={null}
            handleWidgetUpdate={vi.fn()}
            handleWidgetDelete={vi.fn()}
            readOnly
          />
        </CustomDashboardContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('WidgetWrapper', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('refetches on an analytics invalidation while keeping its data on screen', async () => {
    // Arrange
    const fetchCount = vi.fn().mockResolvedValueOnce({ data: { value: 1 } });
    renderWidget(fetchCount, widgetScopeKey('workspace'));
    expect(await screen.findByText('1')).toBeDefined();
    const refetch = deferred<{ data: { value: number } }>();
    fetchCount.mockReturnValueOnce(refetch.promise);

    // Act: the topic 'list:analytics' fires
    await act(async () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    });

    // Assert: refetching, the previous value stays and no loader shows
    expect(fetchCount).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId('widget-loader')).toBeNull();
    expect(screen.getByTestId('widget-value').textContent).toBe('1');

    // Act: the new value arrives
    await act(async () => {
      refetch.resolve({ data: { value: 2 } });
    });

    // Assert
    await waitFor(() => expect(screen.getByTestId('widget-value').textContent).toBe('2'));
    expect(fetchCount).toHaveBeenLastCalledWith('widget-1', {}, expect.anything());
  });

  it('keeps fetching on its own, outside the query cache, without a scope', async () => {
    // Arrange
    const fetchCount = vi.fn().mockResolvedValue({ data: { value: 7 } });
    renderWidget(fetchCount);
    expect(await screen.findByText('7')).toBeDefined();

    // Act
    await act(async () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    });

    // Assert
    expect(fetchCount).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryCache().findAll({ queryKey: ANALYTICS_KEY })
      .every(query => query.state.data === undefined)).toBe(true);
  });
});
