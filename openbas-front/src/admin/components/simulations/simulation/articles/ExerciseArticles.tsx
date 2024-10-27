import { useParams } from 'react-router-dom';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { addExerciseArticle, deleteExerciseArticle, fetchExerciseArticles, updateExerciseArticle } from '../../../../../actions/channels/article-action';
import Articles from '../../../common/articles/Articles';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { ArticlesHelper } from '../../../../../actions/channels/article-helper';
import type { ArticleCreateInput, ArticleUpdateInput, Exercise } from '../../../../../utils/api-types';
import { ArticleContext } from '../../../common/Context';
import type { ArticleStore, FullArticleStore } from '../../../../../actions/channels/Article';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';

export const articleContextForExercise = (exerciseId: ExerciseStore['exercise_id']) => {
  const dispatch = useAppDispatch();
  return {
    previewArticleUrl: (article: FullArticleStore) => `/channels/${exerciseId}/${article.article_fullchannel?.channel_id}?preview=true`,
    onAddArticle: (data: ArticleCreateInput) => dispatch(addExerciseArticle(exerciseId, data)),
    onUpdateArticle: (article: ArticleStore, data: ArticleUpdateInput) => dispatch(
      updateExerciseArticle(exerciseId, article.article_id, data),
    ),
    onDeleteArticle: (article: ArticleStore) => dispatch(
      deleteExerciseArticle(exerciseId, article.article_id),
    ),
  };
};

const ExerciseArticles = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const articles = useHelper((helper: ArticlesHelper) => helper.getExerciseArticles(exerciseId));
  useDataLoader(() => {
    dispatch(fetchExerciseArticles(exerciseId));
  });
  const context = articleContextForExercise(exerciseId);
  return (
    <ArticleContext.Provider value={context}>
      <Articles articles={articles} />
    </ArticleContext.Provider>
  );
};

export default ExerciseArticles;
