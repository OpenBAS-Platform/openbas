import type { Article, Exercise } from '../../utils/api-types';
import type { ScenarioStore } from '../scenarios/Scenario';

export interface ArticlesHelper {
  getArticlesMap: () => Record<string, Article>;
  getExerciseArticles: (exerciseId: Exercise['exercise_id']) => Article[];
  getScenarioArticles: (scenarioId: ScenarioStore['scenario_id']) => Article[];
}
