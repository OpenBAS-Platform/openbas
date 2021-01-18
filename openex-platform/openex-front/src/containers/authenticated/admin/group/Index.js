import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { GroupOutlined } from '@material-ui/icons';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { fetchGroups } from '../../../../actions/Group';
import { fetchUsers } from '../../../../actions/User';
import { fetchOrganizations } from '../../../../actions/Organization';
import { fetchExercises } from '../../../../actions/Exercise';
import CreateGroup from './CreateGroup';
import GroupPopover from './GroupPopover';

i18nRegister({
  fr: {
    'Groups management': 'Gestion des groupes',
    Name: 'Nom',
    Users: 'Utilisateurs',
    'You do not have any group on the platform.':
      "Vous n'avez aucun groupe sur cette plateforme.",
    users: 'utilisateurs',
  },
});

const styles = () => ({
  title: {
    float: 'left',
    fontSize: '20px',
    fontWeight: 600,
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
  number: {
    float: 'right',
    color: '#9E9E9E',
    fontSize: '12px',
  },
  name: {
    float: 'left',
    width: '25%',
    padding: '5px 0 0 0',
  },
  users: {
    float: 'left',
    textAlign: 'center',
    width: '25%',
    padding: '5px 0 0 0',
  },
});

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = { sortBy: 'group_name', orderAsc: true };
  }

  componentDidMount() {
    this.props.fetchExercises();
    this.props.fetchUsers();
    this.props.fetchOrganizations();
    this.props.fetchGroups();
  }

  reverseBy(field) {
    this.setState({ sortBy: field, orderAsc: !this.state.orderAsc });
  }

  // TODO replace with sortWith after Ramdajs new release
  // eslint-disable-next-line class-methods-use-this
  ascend(a, b) {
    // eslint-disable-next-line no-nested-ternary
    return a < b ? -1 : a > b ? 1 : 0;
  }

  // eslint-disable-next-line class-methods-use-this
  descend(a, b) {
    // eslint-disable-next-line no-nested-ternary
    return a > b ? -1 : a < b ? 1 : 0;
  }

  render() {
    const { classes } = this.props;
    const groups = R.pipe(
      R.values(),
      R.sort((a, b) => {
        // TODO replace with sortWith after Ramdajs new release
        const fieldA = R.toLower(R.propOr('', this.state.sortBy, a).toString());
        const fieldB = R.toLower(R.propOr('', this.state.sortBy, b).toString());
        return this.state.orderAsc
          ? this.ascend(fieldA, fieldB)
          : this.descend(fieldA, fieldB);
      }),
    )(this.props.groups);
    return (
      <div className={classes.container}>
        <div>
          <Typography variant="h5" style={{ float: 'left' }}>
            <T>Groups management</T>
          </Typography>
          <div className="clearfix" />
        </div>
        {groups.length === 0 && (
          <div className={classes.empty}>
            <T>You do not have any group on the platform.</T>
          </div>
        )}
        <List>
          {groups.map((group) => {
            const groupId = R.propOr(Math.random(), 'group_id', group);
            const groupName = R.propOr('-', 'group_name', group);
            const groupUsers = R.propOr([], 'group_users', group);
            return (
              <ListItem key={groupId} divider={true}>
                <ListItemIcon>
                  <GroupOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div>
                      <div className={classes.name}>{groupName}</div>
                      <div className={classes.users}>
                        {groupUsers.length} <T>users</T>
                      </div>
                      <div className="clearfix" />
                    </div>
                  }
                />
                <ListItemSecondaryAction>
                  <GroupPopover
                    group={group}
                    groupUsersIds={group.group_users.map((u) => u.user_id)}
                    organizations={this.props.organizations}
                    users={this.props.users}
                    exercises={this.props.exercises}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <CreateGroup />
      </div>
    );
  }
}

Index.propTypes = {
  groups: PropTypes.object,
  organizations: PropTypes.object,
  exercises: PropTypes.object,
  users: PropTypes.object,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
  fetchExercises: PropTypes.func,
  fetchGroups: PropTypes.func,
};

const select = (state) => ({
  groups: state.referential.entities.groups,
  exercises: state.referential.entities.exercises,
  users: state.referential.entities.users,
  organizations: state.referential.entities.organizations,
});

export default R.compose(
  connect(select, {
    fetchGroups,
    fetchExercises,
    fetchUsers,
    fetchOrganizations,
  }),
  withStyles(styles),
)(Index);
