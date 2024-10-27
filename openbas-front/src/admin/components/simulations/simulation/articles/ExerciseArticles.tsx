import { useParams } from 'react-router-dom';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { fetchExerciseArticles } from '../../../../../actions/channels/article-action';
import Articles from '../../../common/articles/Articles';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { ArticlesHelper } from '../../../../../actions/channels/article-helper';
import type { Exercise } from '../../../../../utils/api-types';
import { ArticleContext } from '../../../common/Context';
import articleContextForExercise from './articleContextForExercise';

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
