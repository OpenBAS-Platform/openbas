import { TooltipProvider } from '@filigran/design-system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type ExerciseSimple, type ExpectationResultsByType } from '../../../../utils/api-types';
import { keyOfTopic, SIMULATIONS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

const fetchExercisesGlobalScoresMock = vi.fn();

vi.mock('../../../../actions/exercises/exercise-action', () => ({ fetchExercisesGlobalScores: fetchExercisesGlobalScoresMock }));
vi.mock('../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    nsdt: (s: string) => s,
    vnsdt: (s: string) => s,
  }),
}));
// The score cell shows how many results it received, so the test can tell the loads apart.
vi.mock('../../../../admin/components/atomic_testings/atomic_testing/AtomicTestingResult', () => ({ default: ({ expectations }: { expectations?: ExpectationResultsByType[] }) => <span>{`scores:${expectations?.length ?? 'none'}`}</span> }));
vi.mock('../../../../components/ItemTags', () => ({ default: () => null }));
vi.mock('../../../../components/ItemTargets', () => ({ default: () => null }));
vi.mock('../../../../admin/components/simulations/simulation/ExerciseStatus', () => ({ default: () => null }));

const { default: SimulationList } = await import('../../../../admin/components/simulations/SimulationList');

const EXERCISES = [{
  exercise_id: 'simulation-1',
  exercise_name: 'First',
}] as ExerciseSimple[];

const scores = (count: number) => ({ data: { global_scores_by_exercise_ids: { 'simulation-1': Array.from({ length: count }, () => ({}) as ExpectationResultsByType) } } });

const renderList = (globalScoresQueryKey?: readonly unknown[]) => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <TooltipProvider>
        <MemoryRouter>
          <SimulationList exercises={EXERCISES} loading={false} isGlobalScoreAsync globalScoresQueryKey={globalScoresQueryKey} />
        </MemoryRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>,
);

describe('SimulationList', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('loads the global scores outside the query cache without a key', async () => {
    // Arrange
    fetchExercisesGlobalScoresMock.mockResolvedValue(scores(1));

    // Act
    renderList();

    // Assert
    expect(await screen.findByText('scores:1')).toBeDefined();
    expect(fetchExercisesGlobalScoresMock).toHaveBeenCalledWith({ exercise_ids: ['simulation-1'] });
    expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdatedAt === 0)).toBe(true);
  });

  it('refetches the global scores of the page when the list topic is invalidated', async () => {
    // Arrange
    fetchExercisesGlobalScoresMock
      .mockResolvedValueOnce(scores(1))
      .mockResolvedValueOnce(scores(2));
    renderList(SIMULATIONS_LIST_KEY);
    expect(await screen.findByText('scores:1')).toBeDefined();

    // Act
    await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic('list:simulations') }));

    // Assert
    await waitFor(() => expect(screen.getByText('scores:2')).toBeDefined());
    expect(fetchExercisesGlobalScoresMock).toHaveBeenCalledTimes(2);
    // The error toast is shown once by the query, not by each call.
    expect(fetchExercisesGlobalScoresMock).toHaveBeenCalledWith({ exercise_ids: ['simulation-1'] }, false);
  });
});
