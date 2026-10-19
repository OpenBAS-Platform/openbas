import { TooltipProvider } from '@filigran/design-system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type Page } from '../../../../components/common/queryable/Page';
import { type SearchPaginationInput, type ThreatArsenalAction } from '../../../../utils/api-types';
import { keyOfTopic, PAYLOADS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

type Search = (input: SearchPaginationInput, notifyError?: boolean) => Promise<{ data: Page<ThreatArsenalAction> }>;
type Counts = (input: SearchPaginationInput, notifyError?: boolean) => Promise<{ data: unknown }>;

const searchThreatArsenalActionsMock = vi.fn<Search>();
const fetchThreatArsenalFacetCountsMock = vi.fn<Counts>(async () => ({
  data: {
    platforms: {},
    statuses: {},
  },
}));
const fetchThreatArsenalAuthorCountsMock = vi.fn<Counts>(async () => ({ data: [] }));
const fetchDomainCountsMock = vi.fn(async (_apiPrefix: string, _input: SearchPaginationInput) => ({ data: [] }));
let liveUpdates = false;

const page = (names: string[]): { data: Page<ThreatArsenalAction> } => ({
  data: {
    content: names.map(name => ({
      injector_contract_id: `id-${name}`,
      action_labels: { en: name },
      action_attack_patterns_ids: [],
      action_domains_ids: [],
    }) as unknown as ThreatArsenalAction),
    pageable: { pageNumber: 0 },
    totalElements: names.length,
    totalPages: 1,
  } as Page<ThreatArsenalAction>,
});

vi.mock('../../../../actions/threat_arsenals/threatArsenal-actions', () => ({
  searchThreatArsenalActions: searchThreatArsenalActionsMock,
  fetchThreatArsenalFacetCounts: fetchThreatArsenalFacetCountsMock,
  fetchThreatArsenalAuthorCounts: fetchThreatArsenalAuthorCountsMock,
  bulkDeleteThreatArsenalActions: vi.fn(),
  exportThreatArsenalCsvMapper: vi.fn(),
}));
vi.mock('../../../../actions/domains/domain-actions', () => ({ fetchDomainCounts: fetchDomainCountsMock }));
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
vi.mock('../../../../store', () => ({ useHelper: (selector: (helper: { getDomains: () => [] }) => unknown) => selector({ getDomains: () => [] }) }));
vi.mock('../../../../utils/permissions/permissionsContext', () => ({
  Can: ({ children }: { children: ReactNode }) => children,
  useAbility: () => ({ can: () => true }),
}));
// The pagination component is real (it owns the query); its toolbar is not under test.
vi.mock('../../../../components/common/queryable/filter/useFilterableProperties', () => ({ default: async () => [] }));
vi.mock('../../../../actions/schema/schema-action', () => ({ engineSchemas: vi.fn() }));
vi.mock('../../../../admin/components/common/filters/KillChainSelect', () => ({ default: () => null }));
vi.mock('../../../../admin/components/common/filters/MitreFilter', () => ({
  default: () => null,
  MITRE_FILTER_KEY: 'injector_contract_attack_patterns',
}));
vi.mock('../../../../admin/components/common/filters/useKillChains', () => ({
  default: () => ({
    killChains: [],
    activeKillChain: undefined,
    selectKillChain: vi.fn(),
  }),
}));
vi.mock('../../../../components/common/queryable/filter/FilterAutocomplete', () => ({ default: () => null }));
vi.mock('../../../../components/common/queryable/filter/FilterChips', () => ({ default: () => null }));
vi.mock('../../../../components/common/queryable/textSearch/TextSearchComponent', () => ({ default: () => null }));
vi.mock('../../../../components/common/queryable/pagination/TablePaginationComponentV2', () => ({ default: () => null }));
vi.mock('../../../../components/common/queryable/sort/SortHeadersComponentV2', () => ({ default: () => null }));
vi.mock('../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../components/common/DialogDelete', () => ({ default: () => null }));
vi.mock('../../../../components/common/ExportButton', () => ({ default: () => null }));
vi.mock('../../../../admin/components/threat_arsenal/ThreatArsenalHero', () => ({ default: ({ rightSlot }: { rightSlot: ReactNode }) => <div>{rightSlot}</div> }));
vi.mock('../../../../admin/components/threat_arsenal/CreateThreatArsenalAction', () => ({
  default: ({ onCreate }: { onCreate: (action: ThreatArsenalAction) => void }) => (
    <button type="button" aria-label="create" onClick={() => onCreate(page(['created']).data.content[0])} />
  ),
}));
vi.mock('../../../../admin/components/threat_arsenal/ImportUploaderThreatArsenal', () => ({ default: () => null }));
vi.mock('../../../../admin/components/threat_arsenal/ThreatArsenalCard', () => ({ default: ({ action }: { action: ThreatArsenalAction }) => <div>{action.action_labels?.en}</div> }));
vi.mock('../../../../admin/components/threat_arsenal/ThreatArsenalListRow', () => ({ default: () => null }));
vi.mock('../../../../admin/components/threat_arsenal/ThreatArsenalEmptyState', () => ({ default: () => null }));
vi.mock('../../../../admin/components/threat_arsenal/ThreatArsenalSidebar', () => ({ default: () => null }));
vi.mock('../../../../admin/components/threat_arsenal/ThreatArsenalSortSelect', () => ({ default: () => null }));
vi.mock('../../../../admin/components/threat_arsenal/ThreatArsenalSelectionBar', () => ({ default: () => null }));
vi.mock('../../../../admin/components/threat_arsenal/ThreatArsenalInformationDrawer', () => ({ default: () => null }));
vi.mock('../../../../admin/components/threat_arsenal/bulk/ThreatArsenalRunTestDrawer', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: ThreatArsenal } = await import('../../../../admin/components/threat_arsenal/ThreatArsenal');

const renderPage = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <TooltipProvider>
        <MemoryRouter initialEntries={['/admin/threat-arsenal']}>
          <ThreatArsenal />
        </MemoryRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>,
);

const fetchingQueriesUnder = (queryKey: readonly unknown[]) => queryClient.getQueryCache()
  .findAll({ queryKey })
  .filter(query => query.state.dataUpdateCount > 0);

describe('ThreatArsenal', () => {
  beforeEach(() => {
    localStorage.clear();
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

    it('loads the list and facets outside the query cache', async () => {
      // Arrange
      searchThreatArsenalActionsMock.mockResolvedValue(page(['first']));

      // Act
      renderPage();

      // Assert
      expect(await screen.findByText('first')).toBeDefined();
      await waitFor(() => expect(fetchThreatArsenalFacetCountsMock).toHaveBeenCalledTimes(1));
      expect(searchThreatArsenalActionsMock).toHaveBeenCalledTimes(1);
      expect(searchThreatArsenalActionsMock.mock.calls[0][1]).toBeUndefined();
      expect(fetchThreatArsenalFacetCountsMock.mock.calls[0][1]).toBeUndefined();
      expect(fetchingQueriesUnder(PAYLOADS_LIST_KEY)).toHaveLength(0);

      // A stream topic has no effect on the legacy page.
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic('list:payloads') }));
      expect(searchThreatArsenalActionsMock).toHaveBeenCalledTimes(1);
      expect(fetchThreatArsenalFacetCountsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('queries the list under the payloads key and refetches the list and every facet on its topic', async () => {
      // Arrange
      searchThreatArsenalActionsMock
        .mockResolvedValueOnce(page(['first']))
        .mockResolvedValueOnce(page(['first', 'second']));
      renderPage();
      expect(await screen.findByText('first')).toBeDefined();
      await waitFor(() => expect(fetchThreatArsenalFacetCountsMock).toHaveBeenCalledTimes(1));
      const authorCalls = fetchThreatArsenalAuthorCountsMock.mock.calls.length;
      const domainCalls = fetchDomainCountsMock.mock.calls.length;
      expect(queryClient.getQueryCache().findAll({ queryKey: [...PAYLOADS_LIST_KEY, 'facets'] })).toHaveLength(1);

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic('list:payloads') }));

      // Assert
      expect(await screen.findByText('second')).toBeDefined();
      expect(searchThreatArsenalActionsMock).toHaveBeenCalledTimes(2);
      // Errors are notified once by the query, not by each attempt.
      expect(searchThreatArsenalActionsMock.mock.calls[0][1]).toBe(false);
      await waitFor(() => expect(fetchThreatArsenalFacetCountsMock).toHaveBeenCalledTimes(2));
      expect(fetchThreatArsenalFacetCountsMock.mock.calls[0][1]).toBe(false);
      await waitFor(() => expect(fetchThreatArsenalAuthorCountsMock.mock.calls.length).toBeGreaterThan(authorCalls));
      await waitFor(() => expect(fetchDomainCountsMock.mock.calls.length).toBeGreaterThan(domainCalls));
    });

    it('refetches the list after a local create instead of inserting the row', async () => {
      // Arrange
      searchThreatArsenalActionsMock
        .mockResolvedValueOnce(page(['first']))
        .mockResolvedValueOnce(page(['first', 'from-server']));
      renderPage();
      expect(await screen.findByText('first')).toBeDefined();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'create' }));

      // Assert
      expect(await screen.findByText('from-server')).toBeDefined();
      expect(screen.queryByText('created')).toBeNull();
      expect(searchThreatArsenalActionsMock).toHaveBeenCalledTimes(2);
    });
  });
});
