import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { addExerciseArticle, deleteExerciseArticle, fetchExerciseArticles, updateExerciseArticle } from '../../../../actions/channels/article-action';
import Articles from '../../components/articles/Articles';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ArticlesHelper } from '../../../../actions/channels/article-helper';
import type { ArticleCreateInput, ArticleUpdateInput, Exercise } from '../../../../utils/api-types';
import DefinitionMenu from '../../components/DefinitionMenu';
import { ArticleContext, ArticleContextType } from '../../components/Context';
import type { ArticleStore, FullArticleStore } from '../../../../actions/channels/Article';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

const ExerciseArticles = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const articles = useHelper((helper: ArticlesHelper) => helper.getExerciseArticles(exerciseId));
  useDataLoader(() => {
    dispatch(fetchExerciseArticles(exerciseId));
  });

  const context: ArticleContextType = {
    previewArticleUrl: (article: FullArticleStore) => `/channels/${exerciseId}/${article.article_fullchannel.channel_id}?preview=true`,
    onAddArticle: (data: ArticleCreateInput) => dispatch(addExerciseArticle(exerciseId, data)),
    onUpdateArticle: (article: ArticleStore, data: ArticleUpdateInput) => dispatch(
      updateExerciseArticle(exerciseId, article.article_id, data),
    ),
    onDeleteArticle: (article: ArticleStore) => dispatch(
      deleteExerciseArticle(exerciseId, article.article_id),
    ),
  };

  return (
    <ArticleContext.Provider value={context}>
      <div className={classes.container}>
        <DefinitionMenu base="/admin/exercises" id={exerciseId} />
        <Articles articles={articles} />
      </div>
    </ArticleContext.Provider>
  );
};

export default ExerciseArticles;
