import { TooltipProvider } from '@filigran/design-system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type Page } from '../../../../components/common/queryable/Page';
import { type FindingOutput, type FindingSummaryOutput, type RelatedFindingOutput, type SearchPaginationInput } from '../../../../utils/api-types';
import { findingKey, keyOfTopic } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

const FINDING_ID = 'finding-1';

const fetchFindingMock = vi.fn<(findingId: string, notifyError?: boolean) => Promise<{ data: FindingOutput }>>();
const fetchFindingSummaryMock = vi.fn<(findingId: string, notifyError?: boolean) => Promise<{ data: FindingSummaryOutput }>>();
const searchFindingsMock = vi.fn<(input: SearchPaginationInput, notifyError?: boolean) => Promise<{ data: Page<RelatedFindingOutput> }>>();
const fetchFindingVulnerabilityMock = vi.fn<(cveId: string, notifyError?: boolean) => Promise<unknown>>();
const fetchVulnerabilityByExternalIdMock = vi.fn<(cveId: string) => Promise<unknown>>();
const notifyErrorHandlerMock = vi.fn();
let liveUpdates = false;

const finding = (value: string, type = 'text', field = 'output') => ({
  finding_id: FINDING_ID,
  finding_type: type,
  finding_value: value,
  finding_field: field,
  finding_tags: [],
}) as unknown as FindingOutput;

const summary = (occurrences: number) => ({
  finding_occurrences: occurrences,
  finding_assets_count: 0,
}) as FindingSummaryOutput;

const occurrences: { data: Page<RelatedFindingOutput> } = {
  data: {
    content: [],
    pageable: { pageNumber: 0 },
    totalElements: 0,
    totalPages: 0,
  } as unknown as Page<RelatedFindingOutput>,
};

const NOT_FOUND = {
  status: 404,
  message: 'Not found',
};

vi.mock('../../../../actions/findings/finding-actions', () => ({
  fetchFinding: fetchFindingMock,
  fetchFindingSummary: fetchFindingSummaryMock,
  searchFindings: searchFindingsMock,
  fetchFindingVulnerability: fetchFindingVulnerabilityMock,
}));
vi.mock('../../../../actions/vulnerability-actions', () => ({ fetchVulnerabilityByExternalId: fetchVulnerabilityByExternalIdMock }));
vi.mock('../../../../utils/error/errorHandlerUtil', () => ({ notifyErrorHandler: notifyErrorHandlerMock }));
vi.mock('../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../utils/hooks/useEnterpriseEdition', () => ({ default: () => ({ isValidated: true }) }));
vi.mock('../../../../utils/permissions/permissionsContext', () => ({ useAbility: () => ({ can: () => false }) }));
vi.mock('../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    nsdt: (s: string) => s,
    fldt: (s: string) => s,
    fndt: (s: string) => s,
  }),
}));
vi.mock('../../../../components/common/detail/EntityDetailCommon', () => ({
  DetailHero: ({ title, stats }: {
    title: string;
    stats: ReactNode;
  }) => (
    <>
      <h1>{title}</h1>
      {stats}
    </>
  ),
  HeroStat: ({ label, value }: {
    label: string;
    value: ReactNode;
  }) => <span>{`${label}: ${value}`}</span>,
  Field: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  InformationGrid: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SectionLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SectionBlock: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../../../components/Loader', () => ({ default: () => <div role="progressbar" /> }));
vi.mock('../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../components/FindingIcon', () => ({ default: () => null }));
vi.mock('../../../../components/ItemTags', () => ({ default: () => null }));
vi.mock('../../../../components/ItemTargets', () => ({ default: () => null }));
vi.mock('../../../../admin/components/findings/FindingContextLink', () => ({ default: () => null }));
// The pagination component of the occurrences is real (it owns the query); its toolbar is not under test.
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
vi.mock('../../../../components/PaginatedListLoader', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: FindingOverview } = await import('../../../../admin/components/findings/FindingOverview');

const renderOverview = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[`/admin/findings/${FINDING_ID}`]}>
          <Routes>
            <Route path="/admin/findings/:findingId" element={<FindingOverview />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>,
);

const invalidateFindingTopic = () => act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`finding:${FINDING_ID}`) }));

const UNAVAILABLE = 'Finding is currently unavailable or you do not have sufficient permissions to access it.';
const NO_VULNERABILITY = 'There is no information about this vulnerability yet.';

describe('FindingOverview', () => {
  beforeEach(() => {
    localStorage.clear();
    searchFindingsMock.mockResolvedValue(occurrences);
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

    it('loads the finding and its sections outside the query cache', async () => {
      // Arrange
      fetchFindingMock.mockResolvedValue({ data: finding('CVE-2024-0001', 'cve') });
      fetchFindingSummaryMock.mockResolvedValue({ data: summary(3) });
      fetchVulnerabilityByExternalIdMock.mockResolvedValue({ data: null });

      // Act
      renderOverview();

      // Assert
      expect(await screen.findByRole('heading', { name: 'CVE-2024-0001' })).toBeDefined();
      expect(await screen.findByText(NO_VULNERABILITY)).toBeDefined();
      expect(fetchFindingMock).toHaveBeenCalledWith(FINDING_ID);
      expect(fetchFindingSummaryMock).toHaveBeenCalledWith(FINDING_ID);
      expect(fetchVulnerabilityByExternalIdMock).toHaveBeenCalledWith('CVE-2024-0001');
      expect(fetchFindingVulnerabilityMock).not.toHaveBeenCalled();
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('refetches the finding, its summary and its occurrences when its topic is invalidated', async () => {
      // Arrange
      fetchFindingMock
        .mockResolvedValueOnce({ data: finding('First', 'text', 'before') })
        .mockResolvedValueOnce({ data: finding('First', 'text', 'after') });
      fetchFindingSummaryMock
        .mockResolvedValueOnce({ data: summary(1) })
        .mockResolvedValueOnce({ data: summary(2) });
      renderOverview();
      expect(await screen.findByText('before')).toBeDefined();
      expect(await screen.findByText('Occurrences: 1')).toBeDefined();
      await vi.waitFor(() => expect(searchFindingsMock).toHaveBeenCalledTimes(1));
      expect(queryClient.getQueryCache().findAll({ queryKey: [...findingKey(FINDING_ID), 'occurrences'] })).toHaveLength(1);

      // Act
      await invalidateFindingTopic();

      // Assert
      expect(await screen.findByText('after')).toBeDefined();
      expect(await screen.findByText('Occurrences: 2')).toBeDefined();
      expect(searchFindingsMock).toHaveBeenCalledTimes(2);
      // Errors are notified once by the queries, not by each attempt.
      expect(fetchFindingMock).toHaveBeenCalledWith(FINDING_ID, false);
      expect(fetchFindingSummaryMock).toHaveBeenCalledWith(FINDING_ID, false);
      expect(searchFindingsMock.mock.calls[0][1]).toBe(false);
    });

    it('shows the unavailable warning on a 404, without retrying and with one toast', async () => {
      // Arrange
      fetchFindingMock.mockRejectedValue(NOT_FOUND);
      fetchFindingSummaryMock.mockRejectedValue(NOT_FOUND);

      // Act
      renderOverview();

      // Assert
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
      expect(fetchFindingMock).toHaveBeenCalledTimes(1);
      expect(notifyErrorHandlerMock).toHaveBeenCalledTimes(1);
    });

    it('replaces the finding with the warning when it disappears while on screen', async () => {
      // Arrange
      fetchFindingMock
        .mockResolvedValueOnce({ data: finding('First') })
        .mockRejectedValueOnce(NOT_FOUND);
      fetchFindingSummaryMock
        .mockResolvedValueOnce({ data: summary(1) })
        .mockRejectedValueOnce(NOT_FOUND);
      renderOverview();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Act
      await invalidateFindingTopic();

      // Assert
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
      expect(notifyErrorHandlerMock).toHaveBeenCalledTimes(1);
    });

    it('queries the vulnerability of a CVE under the finding key, an unknown CVE without a toast', async () => {
      // Arrange
      fetchFindingMock.mockResolvedValue({ data: finding('CVE-2024-0001', 'cve') });
      fetchFindingSummaryMock.mockResolvedValue({ data: summary(1) });
      fetchFindingVulnerabilityMock.mockRejectedValue(NOT_FOUND);
      renderOverview();
      expect(await screen.findByText(NO_VULNERABILITY)).toBeDefined();

      // Act
      await invalidateFindingTopic();

      // Assert
      expect(fetchFindingVulnerabilityMock).toHaveBeenCalledTimes(2);
      expect(fetchFindingVulnerabilityMock).toHaveBeenCalledWith('CVE-2024-0001', false);
      expect(fetchVulnerabilityByExternalIdMock).not.toHaveBeenCalled();
      expect(notifyErrorHandlerMock).not.toHaveBeenCalled();
    });
  });
});
