import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type ScenarioStatistic } from '../../../../../utils/api-types';
import { keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const SCENARIO_ID = 'scenario-1';

const fetchScenarioStatisticMock = vi.fn<(scenarioId: string, notifyError?: boolean) => Promise<{ data: ScenarioStatistic }>>();
let liveUpdates = false;

vi.mock('../../../../../actions/scenarios/scenario-actions', () => ({ fetchScenarioStatistic: fetchScenarioStatisticMock }));
vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../components/Loader', () => ({ default: () => <div role="progressbar" /> }));
// Without results the widget renders its sample preview.
vi.mock('../../../../../admin/components/workspaces/custom_dashboards/widgets/viz/sample/SamplePreview', () => ({ default: () => <p data-testid="sample" /> }));

// Imported after the mocks so the widget picks them up.
const { default: ScenarioDistributionByExercise } = await import('../../../../../admin/components/scenarios/scenario/ScenarioDistributionByExercise');

const emptyStatistic = { data: { simulations_results_latest: { global_scores_by_expectation_type: {} } } as ScenarioStatistic };

const renderWidget = () => render(
  <QueryClientProvider client={queryClient}>
    <ScenarioDistributionByExercise scenarioId={SCENARIO_ID} />
  </QueryClientProvider>,
);

describe('ScenarioDistributionByExercise', () => {
  beforeEach(() => {
    fetchScenarioStatisticMock.mockResolvedValue(emptyStatistic);
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('loads the statistic outside the query cache with live updates off', async () => {
    // Arrange
    liveUpdates = false;

    // Act
    renderWidget();

    // Assert
    expect(await screen.findByTestId('sample')).toBeDefined();
    expect(fetchScenarioStatisticMock).toHaveBeenCalledWith(SCENARIO_ID);
    expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdatedAt === 0)).toBe(true);
  });

  it('refetches the statistic when the scenario topic is invalidated with live updates on', async () => {
    // Arrange
    liveUpdates = true;
    renderWidget();
    expect(await screen.findByTestId('sample')).toBeDefined();

    // Act
    await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`scenario:${SCENARIO_ID}`) }));

    // Assert
    await waitFor(() => expect(fetchScenarioStatisticMock).toHaveBeenCalledTimes(2));
    // Errors are notified once by the query, not by each attempt.
    expect(fetchScenarioStatisticMock).toHaveBeenCalledWith(SCENARIO_ID, false);
  });
});
