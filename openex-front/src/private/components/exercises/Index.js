import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { withStyles } from '@mui/styles';
import { interval } from 'rxjs';
import Exercise from './Exercise';
import { storeBrowser } from '../../../actions/Schema';
import { fetchExercise } from '../../../actions/Exercise';
import inject18n from '../../../components/i18n';
import { FIVE_SECONDS } from '../../../utils/Time';
import Loader from '../../../components/Loader';
import ExerciseHeader from './ExerciseHeader';
import TopBar from '../nav/TopBar';

const interval$ = interval(FIVE_SECONDS);

const styles = () => ({
  root: {
    flexGrow: 1,
  },
});

class Index extends Component {
  componentDidMount() {
    const {
      match: {
        params: { exerciseId },
      },
    } = this.props;
    this.props.fetchExercise(exerciseId);
    this.subscription = interval$.subscribe(() => {
      this.props.fetchExercise(exerciseId);
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { classes, exercise } = this.props;
    if (exercise && exercise.exercise_name) {
      return (
        <div className={classes.root}>
          <TopBar />
          <ExerciseHeader exercise={exercise} />
          <Switch>
            <Route
              exact
              path="/exercises/:exerciseId"
              render={(routeProps) => (
                <Exercise {...routeProps} exercise={exercise} />
              )}
            />
          </Switch>
        </div>
      );
    }
    return <Loader />;
  }
}

Index.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  match: PropTypes.object,
  exercise: PropTypes.object,
  fetchExercise: PropTypes.func,
};

const select = (state, ownProps) => {
  const browser = storeBrowser(state);
  const {
    match: {
      params: { exerciseId },
    },
  } = ownProps;
  return {
    exercise: browser.getExercise(exerciseId),
  };
};

export default R.compose(
  connect(select, { fetchExercise }),
  inject18n,
  withRouter,
  withStyles(styles),
)(Index);
