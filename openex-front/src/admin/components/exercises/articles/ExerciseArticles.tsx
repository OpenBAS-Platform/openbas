import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchExerciseArticles } from '../../../../actions/channels/article-action';
import Articles from '../../components/articles/Articles';
import ExerciseOrScenarioContext from '../../../ExerciseOrScenarioContext';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ExercicesHelper } from '../../../../actions/helper';
import type { ArticlesHelper } from '../../../../actions/channels/article-helper';
import type { Exercise } from '../../../../utils/api-types';
import DefinitionMenu from '../../components/DefinitionMenu';

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
  const { exercise, articles } = useHelper((helper: ExercicesHelper & ArticlesHelper) => ({
    exercise: helper.getExercise(exerciseId),
    articles: helper.getExerciseArticles(exerciseId),
  }));
  useDataLoader(() => {
    dispatch(fetchExerciseArticles(exerciseId));
  });
  return (
    <div className={classes.container}>
      <DefinitionMenu base="/admin/exercises" id={exerciseId} />
      <ExerciseOrScenarioContext.Provider value={{ exercise }}>
        <Articles articles={articles} />
      </ExerciseOrScenarioContext.Provider>
    </div>
  );
};

export default ExerciseArticles;
