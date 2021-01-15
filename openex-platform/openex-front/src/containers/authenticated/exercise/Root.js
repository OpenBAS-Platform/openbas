import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Route, Switch, withRouter } from 'react-router';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import {
  redirectToExercise,
  redirectToHome,
} from '../../../actions/Application';
import LeftBar from './nav/LeftBar';
import { fetchExercise } from '../../../actions/Exercise';
import IndexExercise from './Index';
import IndexExerciseExecution from './execution/Index';
import IndexExerciseLessons from './lessons/Index';
import IndexExerciseChecks from './check/Index';
import IndexExerciseDryrun from './check/Dryrun';
import IndexExerciseComcheck from './check/Comcheck';
import IndexExerciseObjectives from './objective/Index';
import IndexExerciseScenario from './scenario/Index';
import IndexExerciseScenarioEvent from './scenario/event/Index';
import IndexExerciseAudiences from './audiences/Index';
import IndexExerciseAudiencesAudience from './audiences/audience/Index';
import IndexExerciseDocuments from './documents/Index';
import IndexExerciseStatistics from './statistics/Index';
import IndexExerciseSettings from './settings/Index';
import UserPopover from '../UserPopover';

const styles = (theme) => ({
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    padding: 20,
  },
  logo: {
    width: '40px',
    cursor: 'pointer',
  },
  title: {
    fontSize: 25,
    marginLeft: 20,
  },
  toolbar: theme.mixins.toolbar,
});

class RootExercise extends Component {
  componentDidMount() {
    this.props.fetchExercise(this.props.id);
  }

  redirectToExercise() {
    this.props.redirectToExercise(this.props.id);
  }

  redirectToHome() {
    this.props.redirectToHome();
  }

  render() {
    const { classes } = this.props;
    return (
      <div style={{ paddingLeft: 180 }}>
        <LeftBar
          id={this.props.id}
          pathname={this.props.pathname}
          exercise_type={R.propOr(
            'standard',
            'exercise_type',
            this.props.exercise,
          )}
        />
        <AppBar position="fixed" className={classes.appBar}>
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
        <div className={classes.toolbar} />
        <div className={classes.container}>
          <Switch>
            <Route
              exact
              path="/private/exercise/:exerciseId"
              component={() => <IndexExercise id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/execution"
              component={() => <IndexExerciseExecution id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/lessons"
              component={() => <IndexExerciseLessons id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/checks"
              component={() => <IndexExerciseChecks id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/checks/dryrun/:dryrunId"
              component={() => <IndexExerciseDryrun id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/checks/comcheck/:comcheckId"
              component={() => <IndexExerciseComcheck id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/objectives"
              component={() => <IndexExerciseObjectives id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/scenario"
              component={() => <IndexExerciseScenario id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/scenario/:eventId"
              component={() => (
                <IndexExerciseScenarioEvent id={this.props.id} />
              )}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/audiences"
              component={() => <IndexExerciseAudiences id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/audiences/:audienceId"
              component={() => (
                <IndexExerciseAudiencesAudience id={this.props.id} />
              )}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/calendar"
              component={() => <IndexExercise id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/documents"
              component={() => <IndexExerciseDocuments id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/statistics"
              component={() => <IndexExerciseStatistics id={this.props.id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/settings"
              component={() => <IndexExerciseSettings id={this.props.id} />}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

RootExercise.propTypes = {
  id: PropTypes.string,
  pathname: PropTypes.string,
  leftBarOpen: PropTypes.bool,
  exercise: PropTypes.object,
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  redirectToExercise: PropTypes.func,
  children: PropTypes.node,
  fetchExercise: PropTypes.func.isRequired,
  params: PropTypes.object,
};

const select = (state, ownProps) => {
  const { exerciseId } = ownProps.match.params;
  const { pathname } = ownProps.location;
  return {
    id: exerciseId,
    pathname,
    exercise: R.prop(exerciseId, state.referential.entities.exercises),
  };
};

export default R.compose(
  withRouter,
  connect(select, {
    redirectToExercise,
    redirectToHome,
    fetchExercise,
  }),
  withStyles(styles),
)(RootExercise);
