import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import * as R from 'ramda';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import { dateFormat, timeDiff } from '../../utils/Time';
import { fetchExercises } from '../../actions/Exercise';
import { dataFile } from '../../actions/File';
import { Exercise } from '../../components/Exercise';
import UserPopover from './UserPopover';
import { T } from '../../components/I18n';
import { i18nRegister } from '../../utils/Messages';
import CreateExercise from './exercise/CreateExercise';

i18nRegister({
  fr: {
    'You do not have any available exercise on this platform.':
      "Vous n'avez aucun exercice disponible sur cette plateforme.",
  },
});

const styles = () => ({
  root: {
    flexGrow: 1,
  },
  logo: {
    width: '40px',
    cursor: 'pointer',
  },
  title: {
    fontSize: 25,
    marginLeft: 20,
  },
  empty: {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
});

class IndexAuthenticated extends Component {
  componentDidMount() {
    this.props.fetchExercises();
  }

  redirectToHome() {
    this.props.history.push('/private');
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <img
              src="/images/logo_white.png"
              alt="logo"
              className={classes.logo}
              onClick={this.redirectToHome.bind(this)}
            />
            <div className={classes.title}>OpenEx</div>
            <UserPopover />
          </Toolbar>
        </AppBar>
        <div className={classes.container}>
          {this.props.exercises.length === 0 && (
            <div className={classes.empty}>
              <T>You do not have any available exercise on this platform.</T>
            </div>
          )}
          {this.props.exercises.map((exercise) => {
            const startDate = dateFormat(
              exercise.exercise_start_date,
              'MMM D, YYYY',
            );
            const endDate = dateFormat(
              exercise.exercise_end_date,
              'MMM D, YYYY',
            );
            const fileId = R.pathOr(
              null,
              ['exercise_image', 'file_id'],
              exercise,
            );
            return (
              <Link
                to={`/private/exercise/${exercise.exercise_id}`}
                key={exercise.exercise_id}
              >
                <Exercise
                  name={exercise.exercise_name}
                  subtitle={exercise.exercise_subtitle}
                  description={exercise.exercise_description}
                  startDate={startDate}
                  endDate={endDate}
                  status={exercise.exercise_status}
                  organizer={exercise.exercise_organizer}
                  image_id={fileId}
                />
              </Link>
            );
          })}
        </div>
        {this.props.userAdmin && <CreateExercise />}
      </div>
    );
  }
}

const sortExercises = (exercises) => {
  const exercisesSorting = R.pipe(
    R.sort((a, b) => timeDiff(a.exercise_start_date, b.exercise_start_date)),
  );
  return exercisesSorting(exercises);
};

IndexAuthenticated.propTypes = {
  exercises: PropTypes.array,
  fetchExercises: PropTypes.func,
  dataFile: PropTypes.func,
  logout: PropTypes.func,
  redirectToHome: PropTypes.func,
  userAdmin: PropTypes.bool,
};

const select = (state) => {
  const userId = R.path(['logged', 'user'], state.app);
  return {
    exercises: sortExercises(R.values(state.referential.entities.exercises)),
    userAdmin: R.path([userId, 'user_admin'], state.referential.entities.users),
  };
};

export default R.compose(
  withRouter,
  connect(select, { fetchExercises, dataFile }),
  withStyles(styles),
)(IndexAuthenticated);
