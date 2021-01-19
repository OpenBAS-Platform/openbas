import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import { GroupOutlined } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import { fetchUsers } from '../../../../../actions/User';
import { fetchOrganizations } from '../../../../../actions/Organization';

const styles = (theme) => ({
  container: {
    padding: '10px 0px 10px 0px',
  },
  story: {},
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

class AudienceView extends Component {
  componentDidMount() {
    this.props.fetchUsers();
    this.props.fetchOrganizations();
  }

  render() {
    const { classes } = this.props;
    const filterSubaudiences = (subaudiences, audienceId) => {
      const subaudiencesFilterAndSorting = R.pipe(
        R.values,
        R.filter((n) => n.subaudience_audience.audience_id === audienceId),
        R.sort((a, b) => a.subaudience_name.localeCompare(b.subaudience_name)),
      );
      return subaudiencesFilterAndSorting(subaudiences);
    };
    let subaudiences = [];
    if (this.props.audience) {
      subaudiences = filterSubaudiences(
        this.props.subaudiences,
        this.props.audience.audience_id,
      );
    }
    return (
      <div className={classes.container}>
        <List>
          {subaudiences.map((subaudience) => {
            const nestedItems = subaudience.subaudience_users.map((data) => {
              const user = R.propOr({}, data.user_id, this.props.users);
              const userId = R.propOr(data.user_id, 'user_id', user);
              const userFirstname = R.propOr('-', 'user_firstname', user);
              const userLastname = R.propOr('-', 'user_lastname', user);
              const userGravatar = R.propOr('', 'user_gravatar', user);
              const userOrganization = R.propOr(
                {},
                user.user_organization,
                this.props.organizations,
              );
              const organizationName = R.propOr(
                '-',
                'organization_name',
                userOrganization,
              );
              return (
                <ListItem
                  key={userId}
                  divider={true}
                  className={classes.nested}
                >
                  <ListItemAvatar>
                    <Avatar src={userGravatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${userFirstname} ${userLastname}`}
                    secondary={organizationName}
                  />
                </ListItem>
              );
            });
            return (
              <div key={subaudience.subaudience_id}>
                <ListItem divider={true}>
                  <ListItemIcon>
                    <GroupOutlined />
                  </ListItemIcon>
                  <ListItemText primary={subaudience.subaudience_name} />{' '}
                </ListItem>
                <Collapse in={true}>
                  <List>{nestedItems}</List>
                </Collapse>
              </div>
            );
          })}
        </List>
      </div>
    );
  }
}

AudienceView.propTypes = {
  audience: PropTypes.object,
  subaudiences: PropTypes.object,
  organizations: PropTypes.object,
  users: PropTypes.object,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
};

const select = (state) => ({
  users: state.referential.entities.users,
  organizations: state.referential.entities.organizations,
});

export default R.compose(
  connect(select, {
    fetchUsers,
    fetchOrganizations,
  }),
  withStyles(styles),
)(AudienceView);
