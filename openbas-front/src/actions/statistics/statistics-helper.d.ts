import type { ExpectationResultsByType } from '../../utils/api-types';
import type { ExerciseInjectExpectationResultsByTypeStore } from '../exercises/Exercise';

export interface StatisticsHelper {
  getStatistics: () => PlatformStatistic;
}

export interface PlatformStatistic {
  platform_id: string;
  scenarios_count: StatisticElement;
  exercises_count: StatisticElement;
  users_count: StatisticElement;
  teams_count: StatisticElement;
  assets_count: StatisticElement;
  asset_groups_count: StatisticElement;
  injects_count: StatisticElement;
  expectation_results: ExpectationResultsByType[];
  inject_expectation_results: ExerciseInjectExpectationResultsByTypeStore[];
}

interface StatisticElement {
  global_count: number;
  progression_count: number;
}
