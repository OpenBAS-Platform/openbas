import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography from '@mui/material/Typography';
import withStyles from '@mui/styles/withStyles';
import { GroupOutlined } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import { timeDiff } from '../../../../../utils/Time';
import { fetchGroups } from '../../../../../actions/Group';
import { fetchUsers } from '../../../../../actions/User';
import { fetchOrganizations } from '../../../../../actions/Organization';
import { fetchAudiences } from '../../../../../actions/Audience';
import { fetchComchecks } from '../../../../../actions/Comcheck';
import Theme from '../../../../../components/Theme';
import { SearchField } from '../../../../../components/SearchField';
import AudiencePopover from './AudiencePopover';
import AddUsers from './AddUsers';
import UserPopover from './UserPopover';
import UserView from './UserView';
import { storeBrowser } from '../../../../../actions/Schema';

i18nRegister({
  fr: {
    Name: 'Nom',
    'Email address': 'Adresse email',
    Organization: 'Organisation',
    'You do not have any audiences in this exercise.':
      "Vous n'avez aucune audience dans cet exercice.",
    'This audience is empty.': 'Cette audience est vide.',
    'This sub-audience is empty.': 'Cette sous-audience est vide.',
    'Comcheck currently running': 'Comcheck en cours',
    'User view': "Vue de l'utilisateur",
    'user(s)': 'utilisateur(s)',
  },
});

const styles = () => ({
  toolbar: {
    position: 'fixed',
    top: 0,
    right: 320,
    zIndex: '5000',
    backgroundColor: 'none',
  },
  header: {
    avatar: {
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
      padding: '12px 0 0 15px',
    },
    user_firstname: {
      float: 'left',
      width: '30%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    user_email: {
      float: 'left',
      width: '40%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    user_organization: {
      float: 'left',
      width: '30%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
  },
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
  search: {
    float: 'right',
  },
  name: {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mail: {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  org: {
    float: 'left',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  comcheck: {
    float: 'left',
    margin: '-16px 0px 0px -15px',
  },
  enabled: {
    color: green[500],
  },
  disabled: {
    color: red[500],
  },
});

class IndexAudience extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'user_firstname',
      orderAsc: true,
      searchTerm: '',
      openView: false,
      currentUser: {},
    };
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
    this.props.fetchGroups();
    this.props.fetchUsers();
    this.props.fetchOrganizations();
    this.props.fetchComchecks(this.props.exerciseId);
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

  // eslint-disable-next-line class-methods-use-this
  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor;
    }
    return Theme.palette.textColor;
  }

  handleOpenView(user) {
    this.setState({
      currentUser: user,
      openView: true,
    });
  }

  handleCloseView() {
    this.setState({
      openView: false,
    });
  }

  renderUsers() {
    const {
      classes,
      exerciseId,
      audienceId,
      audience,
    } = this.props;
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const users = R.pipe(
      R.map((userId) => this.props.users[userId]),
      R.filter(filterByKeyword),
      R.sort((a, b) => {
        // TODO replace with sortWith after Ramdajs new release
        const fieldA = R.toLower(R.propOr('', this.state.sortBy, a));
        const fieldB = R.toLower(R.propOr('', this.state.sortBy, b));
        return this.state.orderAsc
          ? this.ascend(fieldA, fieldB)
          : this.descend(fieldA, fieldB);
      }),
    )(audience.audience_users);
    return (
      <div>
        {audience.audience_users.length === 0 && (
          <div className={classes.empty}>
            <T>This audience is empty.</T>
          </div>
        )}
        <List>
          {users.map((user) => {
            const userId = R.propOr(Math.random(), 'user_id', user);
            const userFirstname = R.propOr('-', 'user_firstname', user);
            const userLastname = R.propOr('-', 'user_lastname', user);
            const userEmail = R.propOr('-', 'user_email', user);
            const userGravatar = R.propOr('', 'user_gravatar', user);
            const userOrganization = this.props.organizations[user?.user_organization] ?? {};
            const organizationName = userOrganization?.organization_name ?? '-';
            return (
              <ListItem
                key={userId}
                divider={true}
                button={true}
                onClick={this.handleOpenView.bind(this, user)}
              >
                <ListItemAvatar>
                  <Avatar src={userGravatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={`${userFirstname} ${userLastname}`}
                  secondary={userEmail}
                />
                <div style={{ marginRight: 200 }}>{organizationName}</div>
                <ListItemSecondaryAction>
                  <UserPopover
                    exerciseId={exerciseId}
                    audience={audience}
                    user={user}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <Dialog
          open={this.state.openView}
          onClose={this.handleCloseView.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{`${this.state.currentUser.user_firstname} ${this.state.currentUser.user_lastname}`}</DialogTitle>
          <DialogContent>
            <UserView
              user={this.state.currentUser}
              organizations={this.props.organizations}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseView.bind(this)}
            >
              <T>Close</T>
            </Button>
          </DialogActions>
        </Dialog>
        {this.props.exercise?.user_can_update && (
          <AddUsers
            exerciseId={exerciseId}
            audienceId={audienceId}
            audienceUsersIds={audience.audience_users}
          />
        )}
      </div>
    );
  }

  render() {
    const {
      classes,
      exerciseId,
      audienceId,
      audience,
    } = this.props;
    if (audience) {
      return (
        <div className={classes.container}>
          <div style={{ float: 'left', display: 'flex' }}>
            <GroupOutlined
              fontSize="large"
              className={
                audience.audience_enabled ? classes.enabled : classes.disabled
              }
              style={{ marginRight: 10 }}
            />
            <Typography variant="h5">{audience.audience_name}</Typography>
          </div>
          <AudiencePopover
            exerciseId={exerciseId}
            audienceId={audienceId}
            audience={audience}
            audiences={this.props.audiences}
          />
          <div className={classes.search}>
            <SearchField onChange={this.handleSearchUsers.bind(this)} />
          </div>
          <div className="clearfix" />
          { this.renderUsers() }
        </div>
      );
    }
    return <div className={classes.container}> &nbsp; </div>;
  }
}

IndexAudience.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  users: PropTypes.object,
  organizations: PropTypes.object,
  audience: PropTypes.object,
  audiences: PropTypes.array,
  comchecks: PropTypes.array,
  fetchUsers: PropTypes.func,
  fetchGroups: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchOrganizations: PropTypes.func,
  fetchComchecks: PropTypes.func,
};

const filterComchecks = (comchecks, audienceId) => {
  const comchecksFilterAndSorting = R.pipe(
    R.values,
    R.filter(
      (n) => n.comcheck_audience.audience_id === audienceId && !n.comcheck_finished,
    ),
    R.sort((a, b) => timeDiff(a.comcheck_end_date, b.comcheck_end_date)),
  );
  return comchecksFilterAndSorting(comchecks);
};

const select = (state, ownProps) => {
  const { id: exerciseId, audienceId } = ownProps;
  const browser = storeBrowser(state);
  const exercise = browser.getExercise(exerciseId);
  const audience = R.prop(audienceId, state.referential.entities.audiences);
  const audiences = exercise.getAudiences();
  const comchecks = filterComchecks(state.referential.entities.comchecks, audienceId);
  return {
    exerciseId,
    exercise,
    audienceId,
    audience,
    audiences,
    comchecks,
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations,
  };
};

export default R.compose(
  connect(select, {
    fetchGroups,
    fetchUsers,
    fetchAudiences,
    fetchOrganizations,
    fetchComchecks,
  }),
  withStyles(styles),
)(IndexAudience);
