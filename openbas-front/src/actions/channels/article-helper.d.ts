import type { Article, Exercise } from '../../utils/api-types';
import type { ScenarioStore } from '../scenarios/Scenario';
import type { ArticleStore } from './Article';

export interface ArticlesHelper {
  getArticlesMap: () => Record<string, Article>;
  getExerciseArticles: (exerciseId: Exercise['exercise_id']) => ArticleStore[];
  getScenarioArticles: (scenarioId: ScenarioStore['scenario_id']) => ArticleStore[];
}
