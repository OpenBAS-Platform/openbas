import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { Route, Switch } from 'react-router';
import {
  redirectToExercise,
  toggleLeftBar,
} from '../../../actions/Application';
import * as Constants from '../../../constants/ComponentTypes';
import AppBar from '../../../components/AppBar';
import { Chip } from '../../../components/Chip';
import { T } from '../../../components/I18n';
import NavBar from './nav/NavBar';
import LeftBar from './nav/LeftBar';
import UserPopover from '../UserPopover';
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
import IndexUserProfile from '../profile/Index';

const styles = {
  root: {
    padding: '80px 20px 0 85px',
  },
  title: {
    fontVariant: 'small-caps',
    display: 'block',
    float: 'left',
  },
};

class RootAuthenticated extends Component {
  componentDidMount() {
    this.props.fetchExercise(this.props.id);
  }

  toggleLeftBar() {
    this.props.toggleLeftBar();
  }

  redirectToExercise() {
    this.props.redirectToExercise(this.props.id);
  }

  render() {
    return (
      <div>
        <AppBar
          title={
            <div>
              <span style={styles.title}>
                {R.propOr('-', 'exercise_name', this.props.exercise)}
              </span>
              <Chip
                backgroundColor="#C5CAE9"
                type={Constants.CHIP_TYPE_FLOATING}
              >
                <T>{R.propOr('-', 'exercise_status', this.props.exercise)}</T>
              </Chip>
            </div>
          }
          type={Constants.APPBAR_TYPE_TOPBAR}
          onLeftIconButtonTouchTap={this.toggleLeftBar.bind(this)}
          iconElementRight={<UserPopover exerciseId={this.props.id} />}
          showMenuIconButton={false}
        />
        <NavBar
          id={this.props.id}
          pathname={this.props.pathname}
          exercise_type={R.propOr(
            'standard',
            'exercise_type',
            this.props.exercise,
          )}
        />
        <LeftBar
          id={this.props.id}
          pathname={this.props.pathname}
          exercise_type={R.propOr(
            'standard',
            'exercise_type',
            this.props.exercise,
          )}
        />
        <div style={styles.root}>
          <Switch>
            <Route exact path="/private/exercise/:exerciseId" component={IndexExercise} />
            <Route path="execution" component={IndexExerciseExecution} />
            <Route path="lessons" component={IndexExerciseLessons} />
            <Route path="checks" component={IndexExerciseChecks} />
            <Route
                path="checks/dryrun/:dryrunId"
                component={IndexExerciseDryrun}
            />
            <Route
                path="checks/comcheck/:comcheckId"
                component={IndexExerciseComcheck}
            />
            <Route path="objectives" component={IndexExerciseObjectives} />
            <Route path="scenario" component={IndexExerciseScenario} />
            <Route
                path="scenario/:eventId"
                component={IndexExerciseScenarioEvent}
            />
            <Route path="audiences" component={IndexExerciseAudiences} />
            <Route
                path="audiences/:audienceId"
                component={IndexExerciseAudiencesAudience}
            />
            <Route path="calendar" component={IndexExercise} />
            <Route path="documents" component={IndexExerciseDocuments} />
            <Route path="statistics" component={IndexExerciseStatistics} />
            <Route path="settings" component={IndexExerciseSettings} />
            <Route path="profile" component={IndexUserProfile} />
          </Switch>
        </div>
      </div>
    );
  }
}

RootAuthenticated.propTypes = {
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
  const { exerciseId } = ownProps.params;
  const { pathname } = ownProps.location;
  return {
    id: exerciseId,
    pathname,
    exercise: R.prop(exerciseId, state.referential.entities.exercises),
  };
};

export default connect(select, {
  redirectToExercise,
  toggleLeftBar,
  fetchExercise,
})(RootAuthenticated);
