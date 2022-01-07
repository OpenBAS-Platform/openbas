import React from 'react';
import {
  Route, Switch, useParams,
} from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import Exercise from './Exercise';
import { fetchExercise } from '../../../actions/Exercise';
import Loader from '../../../components/Loader';
import ExerciseHeader from './ExerciseHeader';
import TopBar from '../nav/TopBar';
import Audiences from './audiences/Audiences';
import Injects from './injects/Injects';
import { errorWrapper } from '../../../components/Error';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useStore } from '../../../store';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Index = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { exerciseId } = useParams();
  const exercise = useStore((store) => store.getExercise(exerciseId));

  useDataLoader(() => {
    dispatch(fetchExercise(exerciseId));
  });

  if (exercise) {
    return (
        <div className={classes.root}>
          <TopBar />
          <ExerciseHeader/>
          <div className="clearfix" />
          <Switch>
            <Route exact path="/exercises/:exerciseId" render={errorWrapper(Exercise)}/>
            <Route exact path="/exercises/:exerciseId/audiences" render={errorWrapper(Audiences)}/>
            <Route exact path="/exercises/:exerciseId/scenario" render={errorWrapper(Injects)}/>
          </Switch>
        </div>
    );
  }
  return <Loader />;
};

export default Index;
