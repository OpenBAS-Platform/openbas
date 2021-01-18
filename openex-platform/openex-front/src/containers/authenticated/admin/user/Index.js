import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { FlashOnOutlined, FaceOutlined } from '@material-ui/icons';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { fetchUsers } from '../../../../actions/User';
import { fetchOrganizations } from '../../../../actions/Organization';
import { SearchField } from '../../../../components/SearchField';
import CreateUser from './CreateUser';
import UserPopover from './UserPopover';

i18nRegister({
  fr: {
    'Users management': 'Gestion des utilisateurs',
    Name: 'Nom',
    'Email address': 'Adresse email',
    Organization: 'Organisation',
    Administrator: 'Administrateur',
    Planner: 'Planificateur',
    User: 'Utilisateur',
  },
});

const styles = () => ({
  search: {
    float: 'right',
  },
  title: {
    float: 'left',
    fontSize: '20px',
    fontWeight: 600,
  },
  empty: {
    marginTop: 40,
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
    width: '20%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mail: {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  org: {
    float: 'left',
    width: '25%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  admin: {
    float: 'left',
    textAlign: 'center',
    width: '10%',
    padding: '5px 0 0 0',
    display: 'flex',
  },
  planificateur: {
    float: 'left',
    textAlign: 'center',
    width: '10%',
    padding: '5px 0 0 0',
  },
});

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = { sortBy: 'user_firstname', orderAsc: true, searchTerm: '' };
  }

  componentDidMount() {
    this.props.fetchUsers();
    this.props.fetchOrganizations();
  }

  handleSearchUsers(event) {
    this.setState({ searchTerm: event.target.value });
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
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const users = R.pipe(
      R.values(),
      R.filter(filterByKeyword),
      R.sort((a, b) => {
        // TODO replace with sortWith after Ramdajs new release
        const fieldA = R.toLower(R.propOr('', this.state.sortBy, a).toString());
        const fieldB = R.toLower(R.propOr('', this.state.sortBy, b).toString());
        return this.state.orderAsc
          ? this.ascend(fieldA, fieldB)
          : this.descend(fieldA, fieldB);
      }),
    )(this.props.users);
    return (
      <div className={classes.container}>
        <div>
          <Typography variant="h5" style={{ float: 'left' }}>
            <T>Users management</T>
          </Typography>
          <div className={classes.search}>
            <SearchField onChange={this.handleSearchUsers.bind(this)} />
          </div>
          <div className="clearfix" />
        </div>
        <List>
          {R.take(20, users).map((user) => {
            const userId = R.propOr(Math.random(), 'user_id', user);
            const userFirstname = R.propOr('-', 'user_firstname', user);
            const userLastname = R.propOr('-', 'user_lastname', user);
            const userEmail = R.propOr('-', 'user_email', user);
            const userGravatar = R.propOr('', 'user_gravatar', user);
            const userAdmin = R.propOr('-', 'user_admin', user);
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
              <ListItem key={userId} divider={true}>
                <ListItemAvatar>
                  <Avatar src={userGravatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <div>
                      <div className={classes.name}>
                        {userFirstname} {userLastname}
                      </div>
                      <div className={classes.mail}>{userEmail}</div>
                      <div className={classes.org}>{organizationName}</div>
                      {userAdmin ? (
                        <div className={classes.admin}>
                          <FlashOnOutlined color="primary" />&nbsp;&nbsp;
                          <T>Administrator</T>

                        </div>
                      ) : (
                        <div className={classes.admin}>
                          <FaceOutlined color="primary" />&nbsp;&nbsp;
                          <T>User</T>
                        </div>
                      )}
                      <div className="clearfix" />
                    </div>
                  }
                />
                <ListItemSecondaryAction>
                  <UserPopover user={user} />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <CreateUser />
      </div>
    );
  }
}

Index.propTypes = {
  users: PropTypes.object,
  organizations: PropTypes.object,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
};

const select = (state) => ({
  users: state.referential.entities.users,
  organizations: state.referential.entities.organizations,
});

export default R.compose(
  connect(select, { fetchUsers, fetchOrganizations }),
  withStyles(styles),
)(Index);
