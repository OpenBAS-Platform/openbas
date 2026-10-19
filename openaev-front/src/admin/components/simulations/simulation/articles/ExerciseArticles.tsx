import { useParams } from 'react-router';

import { type ArticlesHelper } from '../../../../../actions/channels/article-helper';
import { useHelper } from '../../../../../store';
import { type Exercise } from '../../../../../utils/api-types';
import Articles from '../../../common/articles/Articles';
import { ArticleContext } from '../../../common/Context';
import useSimulationStoreData from '../simulationStoreQueries';
import articleContextForExercise from './articleContextForExercise';

const ExerciseArticles = () => {
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const { articles } = useHelper((helper: ArticlesHelper) => ({ articles: helper.getExerciseArticles(exerciseId) }));
  useSimulationStoreData(exerciseId, ['articles', 'documents', 'channels']);
  const context = articleContextForExercise(exerciseId);
  return (
    <ArticleContext.Provider value={context}>
      <Articles articles={articles} />
    </ArticleContext.Provider>
  );
};

export default ExerciseArticles;
