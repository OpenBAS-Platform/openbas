import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import * as Constants from '../../../constants/ComponentTypes';
import Theme from '../../../components/Theme';
import { T } from '../../../components/I18n';
import { Icon } from '../../../components/Icon';
import { i18nRegister } from '../../../utils/Messages';
/* eslint-disable */
import { fetchExercises } from "../../../actions/Exercise";
import { fetchUsers } from "../../../actions/User";
import { fetchGlobalInjects } from "../../../actions/Inject";
/* eslint-enable */

i18nRegister({
  fr: {
    Exercises: 'Exercices',
    Users: 'Utilisateurs',
    Injects: 'Injects',
  },
});

const styles = {
  container: {
    padding: '50px 0px 0px 0px',
    textAlign: 'center',
  },
  stat: {
    display: 'inline-block',
    width: '300px',
  },
  number: {
    color: Theme.palette.primary1Color,
    fontSize: '60px',
    fontWeight: '400',
  },
  icon: {
    color: Theme.palette.primary1Color,
    margin: '35px 0px 0px 0px',
    fontWeight: '400',
  },
  name: {
    color: Theme.palette.disabledColor,
    fontSize: '12px',
    textTransform: 'uppercase',
  },
};

class Index extends Component {
  componentDidMount() {
    this.props.fetchExercises();
    this.props.fetchUsers();
    this.props.fetchGlobalInjects();
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.stat}>
          <div style={styles.number}>{this.props.exercises.length}</div>
          <div style={styles.icon}>
            <Icon
              name={Constants.ICON_NAME_ACTION_ROWING}
              style={{ width: '40px', height: '40px' }}
              color={Theme.palette.disabledColor}
            />
          </div>
          <div style={styles.name}>
            <T>Exercises</T>
          </div>
        </div>
        <div style={styles.stat}>
          <div style={styles.number}>{this.props.users.length}</div>
          <div style={styles.icon}>
            <Icon
              name={Constants.ICON_NAME_SOCIAL_GROUP}
              style={{ width: '40px', height: '40px' }}
              color={Theme.palette.disabledColor}
            />
          </div>
          <div style={styles.name}>
            <T>Users</T>
          </div>
        </div>
        <div style={styles.stat}>
          <div style={styles.number}>{this.props.injects.length}</div>
          <div style={styles.icon}>
            <Icon
              name={Constants.ICON_NAME_AV_CALL_TO_ACTION}
              style={{ width: '40px', height: '40px' }}
              color={Theme.palette.disabledColor}
            />
          </div>
          <div style={styles.name}>
            <T>Injects</T>
          </div>
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  exercises: PropTypes.array,
  users: PropTypes.array,
  injects: PropTypes.array,
  fetchExercises: PropTypes.func,
  fetchUsers: PropTypes.func,
  fetchGlobalInjects: PropTypes.func,
};

const select = (state) => ({
  exercises: R.values(state.referential.entities.exercises),
  users: R.values(state.referential.entities.users),
  injects: R.values(state.referential.entities.injects),
});

export default connect(select, {
  fetchExercises,
  fetchUsers,
  fetchGlobalInjects,
})(Index);
