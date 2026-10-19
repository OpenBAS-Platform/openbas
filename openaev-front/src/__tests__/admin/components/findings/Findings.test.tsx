import { TooltipProvider } from '@filigran/design-system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type Page } from '../../../../components/common/queryable/Page';
import { type AggregatedFindingOutput, type SearchPaginationInput } from '../../../../utils/api-types';
import { FINDINGS_LIST_KEY, keyOfTopic, scenarioKey } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

type Search = (input: SearchPaginationInput, notifyError?: boolean) => Promise<{ data: Page<AggregatedFindingOutput> }>;

const searchDistinctFindingsMock = vi.fn<Search>();
const searchDistinctFindingsForScenariosMock = vi.fn<(scenarioId: string, input: SearchPaginationInput, notifyError?: boolean) => ReturnType<Search>>();
let liveUpdates = false;

const SCENARIO_ID = 'scenario-1';

const page = (values: string[]): { data: Page<AggregatedFindingOutput> } => ({
  data: {
    content: values.map(value => ({
      finding_id: value,
      finding_type: 'text',
      finding_value: value,
      finding_created_at: '2026-01-01T00:00:00Z',
      finding_updated_at: '2026-01-01T00:00:00Z',
    }) as AggregatedFindingOutput),
    pageable: { pageNumber: 0 },
    totalElements: values.length,
    totalPages: 1,
  } as Page<AggregatedFindingOutput>,
});

vi.mock('../../../../actions/findings/finding-actions', () => ({
  searchDistinctFindings: searchDistinctFindingsMock,
  searchDistinctFindingsForScenarios: searchDistinctFindingsForScenariosMock,
}));
vi.mock('../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../utils/error/errorHandlerUtil', () => ({ notifyErrorHandler: vi.fn() }));
vi.mock('../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    nsdt: (s: string) => s,
  }),
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
vi.mock('../../../../components/PaginatedListLoader', () => ({ default: () => <div role="progressbar" /> }));
vi.mock('../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../components/FindingIcon', () => ({ default: () => null }));
vi.mock('../../../../components/ItemTargets', () => ({ default: () => null }));

// Imported after the mocks so the screens pick them up.
const { default: Findings } = await import('../../../../admin/components/findings/Findings');
const { default: ScenarioFindings } = await import('../../../../admin/components/scenarios/scenario/findings/ScenarioFindings');

const renderAt = (path: string) => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/admin/findings" element={<Findings />} />
            <Route path="/admin/scenarios/:scenarioId/findings" element={<ScenarioFindings />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>,
);

const queriesUnder = (queryKey: readonly unknown[]) => queryClient.getQueryCache().findAll({ queryKey });

describe('Findings', () => {
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

    it('loads the global list outside the query cache', async () => {
      // Arrange
      searchDistinctFindingsMock.mockResolvedValue(page(['first']));

      // Act
      renderAt('/admin/findings');

      // Assert
      expect(await screen.findByText('first')).toBeDefined();
      expect(searchDistinctFindingsMock).toHaveBeenCalledTimes(1);
      expect(searchDistinctFindingsMock.mock.calls[0][1]).toBeUndefined();
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('queries the global list under the findings key and refetches it when its topic is invalidated', async () => {
      // Arrange
      searchDistinctFindingsMock
        .mockResolvedValueOnce(page(['first']))
        .mockResolvedValueOnce(page(['first', 'second']));
      renderAt('/admin/findings');
      expect(await screen.findByText('first')).toBeDefined();
      expect(queriesUnder(FINDINGS_LIST_KEY)).toHaveLength(1);

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic('list:findings') }));

      // Assert
      expect(await screen.findByText('second')).toBeDefined();
      expect(searchDistinctFindingsMock).toHaveBeenCalledTimes(2);
      // Errors are notified once by the query, not by each attempt.
      expect(searchDistinctFindingsMock.mock.calls[0][1]).toBe(false);
    });

    it('keeps the entity key of a screen that embeds the list', async () => {
      // Arrange
      searchDistinctFindingsForScenariosMock
        .mockResolvedValueOnce(page(['scenario-finding']))
        .mockResolvedValueOnce(page(['scenario-finding', 'new-finding']));
      renderAt(`/admin/scenarios/${SCENARIO_ID}/findings`);
      expect(await screen.findByText('scenario-finding')).toBeDefined();
      expect(queriesUnder([...scenarioKey(SCENARIO_ID), 'findings'])).toHaveLength(1);
      expect(queriesUnder(FINDINGS_LIST_KEY)).toHaveLength(0);

      // Act: the global topic does not touch it, its own topic does.
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic('list:findings') }));
      expect(searchDistinctFindingsForScenariosMock).toHaveBeenCalledTimes(1);
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`scenario:${SCENARIO_ID}`) }));

      // Assert
      expect(await screen.findByText('new-finding')).toBeDefined();
      expect(searchDistinctFindingsForScenariosMock).toHaveBeenCalledTimes(2);
      expect(searchDistinctFindingsMock).not.toHaveBeenCalled();
    });
  });
});
