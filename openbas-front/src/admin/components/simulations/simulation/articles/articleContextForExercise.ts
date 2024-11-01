import type { ArticleStore, FullArticleStore } from '../../../../../actions/channels/Article';
import { addExerciseArticle, deleteExerciseArticle, updateExerciseArticle } from '../../../../../actions/channels/article-action';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import type { ArticleCreateInput, ArticleUpdateInput } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';

const articleContextForExercise = (exerciseId: ExerciseStore['exercise_id']) => {
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

export default articleContextForExercise;
