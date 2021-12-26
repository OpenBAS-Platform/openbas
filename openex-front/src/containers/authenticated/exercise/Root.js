import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Route, Switch, withRouter } from 'react-router';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Chip from '@material-ui/core/Chip';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { DescriptionOutlined } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import {
  redirectToExercise,
  redirectToHome,
} from '../../../actions/Application';
import LeftBar from './nav/LeftBar';
import { fetchExercise } from '../../../actions/Exercise';
import { T } from '../../../components/I18n';
import IndexExercise from './Index';
import IndexExerciseExecution from './execution/Index';
import IndexExerciseLessons from './lessons/Index';
import IndexExerciseChecks from './check/Index';
import RootExerciseDryrun from './check/dryrun/Root';
import RootExerciseComcheck from './check/comcheck/Root';
import IndexExerciseObjectives from './objective/Index';
import IndexExerciseEvent from './scenario/Index';
import RootExerciseScenarioEvent from './scenario/Root';
import IndexExerciseAudiences from './audiences/Index';
import RootExerciseAudiencesAudience from './audiences/audience/Root';
import IndexExerciseStatistics from './statistics/Index';
import IndexExerciseSettings from './settings/Index';
import UserPopover from '../UserPopover';
import NotFound from '../../anonymous/NotFound';
import { fetchObjectives } from '../../../actions/Objective';
import { fetchAudiences } from '../../../actions/Audience';
import { fetchExerciseInjects } from '../../../actions/Inject';
import { fetchGroups } from '../../../actions/Group';
import { fetchUsers } from '../../../actions/User';

const styles = (theme) => ({
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    padding: '20px 20px 20px 200px',
  },
  logo: {
    width: '40px',
    cursor: 'pointer',
  },
  title: {
    fontSize: 25,
    marginLeft: 20,
  },
  status: {
    fontSize: 25,
    marginLeft: 20,
  },
  toolbar: theme.mixins.toolbar,
  documents: {
    color: '#ffffff',
    position: 'absolute',
    top: 8,
    right: 70,
  },
});

class RootExercise extends Component {
  componentDidMount() {
    this.props.fetchExercise(this.props.id);
    this.props.fetchUsers();
    this.props.fetchGroups();
    this.props.fetchObjectives(this.props.id);
    this.props.fetchAudiences(this.props.id);
    this.props.fetchExerciseInjects(this.props.id);
  }

  redirectToExercise() {
    this.props.redirectToExercise(this.props.id);
  }

  redirectToHome() {
    this.props.redirectToHome();
  }

  render() {
    const { classes, id, exercise } = this.props;
    const status = R.propOr('SCHEDULED', 'exercise_status', exercise);
    let color = '#009688';
    if (status === 'FINISHED') {
      color = '#388e3c';
    } else if (status === 'RUNNING') {
      color = '#ff5722';
    } else if (status === 'CANCELED') {
      color = '#607d8b';
    }
    return (
      <div>
        <LeftBar
          id={id}
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
            <div className={classes.title}>
              {R.propOr('', 'exercise_name', exercise)}
            </div>
            <Chip
              style={{ marginLeft: 20, backgroundColor: color, color: '#ffffff' }}
              variant="outlined"
              label={
                <T>{R.propOr('SCHEDULED', 'exercise_status', exercise)}</T>
              }
            />
            <IconButton
              component={Link}
              to="/private/documents"
              className={classes.documents}
            >
              <DescriptionOutlined fontSize="default" />
            </IconButton>
            <UserPopover />
          </Toolbar>
        </AppBar>
        <div className={classes.toolbar} />
        <div className={classes.container}>
          <Switch>
            <Route
              exact
              path="/private/exercise/:exerciseId"
              component={() => <IndexExercise id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/execution"
              component={() => <IndexExerciseExecution id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/lessons"
              component={() => <IndexExerciseLessons id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/checks"
              component={() => <IndexExerciseChecks id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/checks/dryrun/:dryrunId"
              component={() => <RootExerciseDryrun id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/checks/comcheck/:comcheckId"
              component={() => <RootExerciseComcheck id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/objectives"
              component={() => <IndexExerciseObjectives id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/scenario"
              component={() => <IndexExerciseEvent id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/scenario/:eventId"
              component={() => <RootExerciseScenarioEvent id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/audiences"
              component={() => <IndexExerciseAudiences id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/audiences/:audienceId"
              component={() => <RootExerciseAudiencesAudience id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/calendar"
              component={() => <IndexExercise id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/statistics"
              component={() => <IndexExerciseStatistics id={id} />}
            />
            <Route
              exact
              path="/private/exercise/:exerciseId/settings"
              component={() => <IndexExerciseSettings id={id} />}
            />
            <Route component={NotFound} />
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
  const { exerciseId, audienceId } = ownProps.match.params;
  const { pathname } = ownProps.location;
  return {
    id: exerciseId,
    audienceId,
    pathname,
    exercise: R.prop(exerciseId, state.referential.entities.exercises),
  };
};

export default R.compose(
  withRouter,
  connect(select, {
    redirectToExercise,
    redirectToHome,
    fetchObjectives,
    fetchAudiences,
    fetchExerciseInjects,
    fetchExercise,
    fetchGroups,
    fetchUsers,
  }),
  withStyles(styles),
)(RootExercise);
