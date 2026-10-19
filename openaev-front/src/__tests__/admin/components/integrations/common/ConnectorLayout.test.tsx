import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const INJECTOR_ID = 'injector-1';
const RELATED_IDS = {
  connector_registered: true,
  catalog_connector_id: 'catalog-1',
  connector_instance_id: 'instance-1',
};

const getRelatedIdsMock = vi.fn();
const fetchSingleMock = vi.fn(() => 'fetch-single');
const fetchConnectorMock = vi.fn(() => 'fetch-catalog');
const fetchConnectorInstanceMock = vi.fn(() => 'fetch-instance');
const dispatchMock = vi.fn(async (action: unknown) => action);
let liveUpdates = false;

vi.mock('../../../../../actions/catalog/catalog-actions', () => ({
  fetchConnector: fetchConnectorMock,
  isXtmComposerIsReachable: vi.fn(async () => ({ data: true })),
}));
vi.mock('../../../../../actions/connector_instances/connector-instance-actions', () => ({ fetchConnectorInstance: fetchConnectorInstanceMock }));
vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../store', () => ({
  useHelper: (selector: (helper: unknown) => unknown) => selector({
    getInjector: (id: string) => ({
      injector_id: id,
      injector_name: 'HTTP injector',
    }),
    getCatalogConnector: () => undefined,
    getConnectorInstance: () => undefined,
  }),
  store: {
    getState: vi.fn(),
    dispatch: vi.fn(),
  },
}));
vi.mock('../../../../../utils/hooks', () => ({ useAppDispatch: () => dispatchMock }));
vi.mock('../../../../../utils/hooks/useDataLoader', async () => {
  const { useEffect } = await import('react');
  return {
    default: (load: () => void) => {
      useEffect(() => {
        load();
      }, []);
    },
  };
});
vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../../components/Loader', () => ({ default: () => <div role="progressbar" /> }));

// Imported after the mocks so the layout picks them up.
const { default: ConnectorLayout } = await import('../../../../../admin/components/integrations/common/ConnectorLayout');
const { ConnectorContext, injectorConfig } = await import('../../../../../admin/components/integrations/common/ConnectorContext');
const { useOutletContext } = await import('react-router');

type ContextValue = Parameters<typeof ConnectorContext.Provider>[0]['value'];

const ConnectorName = () => {
  const { connector } = useOutletContext<{ connector: { name: string } }>();
  return <h1>{connector.name}</h1>;
};

const renderLayout = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <ConnectorContext.Provider value={{
        ...injectorConfig,
        apiRequest: {
          ...injectorConfig.apiRequest,
          getRelatedIds: getRelatedIdsMock,
          fetchSingle: fetchSingleMock,
        },
      } as unknown as ContextValue}
      >
        <MemoryRouter initialEntries={[`/admin/integrations/injectors/${INJECTOR_ID}`]}>
          <Routes>
            <Route path="/admin/integrations/injectors" element={<ConnectorLayout />}>
              <Route path=":injectorId" element={<ConnectorName />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ConnectorContext.Provider>
    </ThemeProvider>
  </QueryClientProvider>,
);

const UNAVAILABLE = 'This item does not exist or you are not allowed to view it.';
const invalidateIntegrationsTopic = () => act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic('list:integrations') }));

describe('ConnectorLayout', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the connector through the data loader, outside the query cache', async () => {
      // Arrange
      getRelatedIdsMock.mockResolvedValue({ data: RELATED_IDS });
      renderLayout();
      expect(await screen.findByRole('heading', { name: 'HTTP injector' })).toBeDefined();

      // Act
      await invalidateIntegrationsTopic();

      // Assert
      expect(getRelatedIdsMock).toHaveBeenCalledTimes(1);
      expect(fetchSingleMock).toHaveBeenCalledWith(INJECTOR_ID);
      expect(fetchConnectorMock).toHaveBeenCalledWith('catalog-1');
      expect(fetchConnectorInstanceMock).toHaveBeenCalledWith('instance-1');
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdateCount === 0)).toBe(true);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('reloads the connector, its catalog entry and its instance when the integrations topic is invalidated', async () => {
      // Arrange
      getRelatedIdsMock.mockResolvedValue({ data: RELATED_IDS });
      renderLayout();
      expect(await screen.findByRole('heading', { name: 'HTTP injector' })).toBeDefined();

      // Act
      await invalidateIntegrationsTopic();

      // Assert
      await vi.waitFor(() => expect(fetchConnectorInstanceMock).toHaveBeenCalledTimes(2));
      expect(getRelatedIdsMock).toHaveBeenCalledTimes(2);
      expect(fetchSingleMock).toHaveBeenCalledTimes(2);
      expect(fetchConnectorMock).toHaveBeenCalledTimes(2);
      // A refetch keeps the page on screen.
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(screen.getByRole('heading', { name: 'HTTP injector' })).toBeDefined();
    });

    it('replaces the page with a warning when the connector disappears', async () => {
      // Arrange
      getRelatedIdsMock
        .mockResolvedValueOnce({ data: RELATED_IDS })
        .mockRejectedValueOnce({
          status: 404,
          message: 'Not found',
        });
      renderLayout();
      expect(await screen.findByRole('heading', { name: 'HTTP injector' })).toBeDefined();

      // Act
      await invalidateIntegrationsTopic();

      // Assert
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
      expect(screen.queryByRole('heading', { name: 'HTTP injector' })).toBeNull();
    });
  });
});
