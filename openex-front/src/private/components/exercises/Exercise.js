import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { connect } from 'react-redux';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { withRouter } from 'react-router-dom';
import { interval } from 'rxjs';
import inject18n from '../../../components/i18n';
import { fetchExercise } from '../../../actions/Exercise';
import { storeBrowser } from '../../../actions/Schema';
import { FIVE_SECONDS } from '../../../utils/Time';
import TopBar from '../nav/TopBar';

const interval$ = interval(FIVE_SECONDS);

const styles = () => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
    height: '100%',
  },
});

class Exercise extends Component {
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
    const { t, classes, exercise } = this.props;
    return (
      <div className={classes.root}>
        <TopBar />
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <Typography variant="overline">{t('Parameters')}</Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              <Typography variant="h6">{t('Description')}</Typography>
              {exercise.exercise_description}
            </Paper>
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="overline">{t('Objectives')}</Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              test
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Exercise.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  match: PropTypes.object,
  exercise: PropTypes.object,
  fetchExercise: PropTypes.func,
};

const select = (state, ownProps) => {
  const browser = storeBrowser(state);
  const { id: exerciseId } = ownProps;
  return {
    exercise: browser.getExercise(exerciseId),
  };
};

export default R.compose(
  connect(select, { fetchExercise }),
  inject18n,
  withRouter,
  withStyles(styles),
)(Exercise);
