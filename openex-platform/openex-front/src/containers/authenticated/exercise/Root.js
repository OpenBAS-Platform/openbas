import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import {
  redirectToExercise,
  toggleLeftBar,
} from '../../../actions/Application';
import * as Constants from '../../../constants/ComponentTypes';
import { AppBar } from '../../../components/AppBar';
import { Chip } from '../../../components/Chip';
import { T } from '../../../components/I18n';
import NavBar from './nav/NavBar';
import LeftBar from './nav/LeftBar';
import UserPopover from '../UserPopover';
import { fetchExercise } from '../../../actions/Exercise';

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
        <div style={styles.root}>{this.props.children}</div>
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
