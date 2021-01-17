import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import { timeDiff } from '../../../../../utils/Time';
import * as Constants from '../../../../../constants/ComponentTypes';
import { fetchGroups } from '../../../../../actions/Group';
import { fetchUsers } from '../../../../../actions/User';
import { fetchOrganizations } from '../../../../../actions/Organization';
import { fetchAudiences } from '../../../../../actions/Audience';
import { fetchSubaudiences } from '../../../../../actions/Subaudience';
import { fetchComchecks } from '../../../../../actions/Comcheck';
import Theme from '../../../../../components/Theme';
import { SearchField } from '../../../../../components/SearchField';
import SubaudienceNav from './SubaudienceNav';
import AudiencePopover from './AudiencePopover';
import AddUsers from './AddUsers';
import UserPopover from './UserPopover';
import UserView from './UserView';

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
  container: {
    paddingRight: '300px',
  },
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
    this.props.fetchSubaudiences(this.props.exerciseId);
    this.props.fetchGroups();
    this.props.fetchUsers();
    this.props.fetchOrganizations();
    this.props.fetchComchecks(this.props.exerciseId);
  }

  handleSearchUsers(event, value) {
    this.setState({ searchTerm: value });
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

  renderSubaudience() {
    const {
      classes,
      exerciseId,
      audienceId,
      audience,
      subaudience,
    } = this.props;
    const subaudienceIsUpdatable = R.propOr(
      true,
      'user_can_update',
      subaudience,
    );
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const users = R.pipe(
      R.map((data) => R.pathOr({}, ['users', data.user_id], this.props)),
      R.filter(filterByKeyword),
      R.sort((a, b) => {
        // TODO replace with sortWith after Ramdajs new release
        const fieldA = R.toLower(R.propOr('', this.state.sortBy, a));
        const fieldB = R.toLower(R.propOr('', this.state.sortBy, b));
        return this.state.orderAsc
          ? this.ascend(fieldA, fieldB)
          : this.descend(fieldA, fieldB);
      }),
    )(subaudience.subaudience_users);
    return (
      <div>
        {subaudience.subaudience_users.length === 0 && (
          <div className={classes.empty}>
            <T>This sub-audience is empty.</T>
          </div>
        )}
        <List>
          {users.map((user) => {
            const userId = R.propOr(Math.random(), 'user_id', user);
            const userFirstname = R.propOr('-', 'user_firstname', user);
            const userLastname = R.propOr('-', 'user_lastname', user);
            const userEmail = R.propOr('-', 'user_email', user);
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
                    subaudience={subaudience}
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
        {subaudienceIsUpdatable && (
          <AddUsers
            exerciseId={exerciseId}
            audienceId={audienceId}
            subaudienceId={subaudience.subaudience_id}
            subaudienceUsersIds={subaudience.subaudience_users.map(
              (u) => u.user_id,
            )}
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
      subaudience,
      subaudiences,
    } = this.props;
    if (audience) {
      return (
        <div className={classes.container}>
          <SubaudienceNav
            exerciseId={exerciseId}
            audienceId={audienceId}
            audience={audience}
            subaudiences={subaudiences}
            selectedSubaudience={R.propOr(null, 'subaudience_id', subaudience)}
            sel
          />
          <Typography variant="h5" style={{ float: 'left' }}>
            {audience.audience_name}
          </Typography>
          <AudiencePopover
            exerciseId={exerciseId}
            audienceId={audienceId}
            audience={audience}
            audiences={this.props.audiences}
          />
          <div className={classes.search}>
            <SearchField
              name="keyword"
              fullWidth={true}
              type="text"
              hintText="Search"
              onChange={this.handleSearchUsers.bind(this)}
              styletype={Constants.FIELD_TYPE_RIGHT}
            />
          </div>
          <div className="clearfix" />
          {subaudience ? (
            this.renderSubaudience()
          ) : (
            <div className={classes.empty}>
              <T>This audience is empty.</T>
            </div>
          )}
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
  subaudience: PropTypes.object,
  subaudiences: PropTypes.array,
  comchecks: PropTypes.array,
  userCanUpdate: PropTypes.bool,
  fetchUsers: PropTypes.func,
  fetchGroups: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchSubaudiences: PropTypes.func,
  fetchOrganizations: PropTypes.func,
  fetchComchecks: PropTypes.func,
};

const filterAudiences = (audiences, exerciseId) => {
  const audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name)),
  );
  return audiencesFilterAndSorting(audiences);
};

const filterSubaudiences = (subaudiences, audienceId) => {
  const subaudiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.subaudience_audience.audience_id === audienceId),
    R.sort((a, b) => a.subaudience_name.localeCompare(b.subaudience_name)),
  );
  return subaudiencesFilterAndSorting(subaudiences);
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

const checkUserCanUpdate = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const userId = R.path(['logged', 'user'], state.app);
  let userCanUpdate = R.path(
    [userId, 'user_admin'],
    state.referential.entities.users,
  );
  if (!userCanUpdate) {
    const groupValues = R.values(state.referential.entities.groups);
    groupValues.forEach((group) => {
      group.group_grants.forEach((grant) => {
        if (
          grant
          && grant.grant_exercise
          && grant.grant_exercise.exercise_id === exerciseId
          && grant.grant_name === 'PLANNER'
        ) {
          group.group_users.forEach((user) => {
            if (user && user.user_id === userId) {
              userCanUpdate = true;
            }
          });
        }
      });
    });
  }

  return userCanUpdate;
};

const select = (state, ownProps) => {
  const { id: exerciseId, audienceId } = ownProps;
  const audience = R.prop(audienceId, state.referential.entities.audiences);
  const audiences = filterAudiences(
    state.referential.entities.audiences,
    exerciseId,
  );
  const subaudiences = filterSubaudiences(
    state.referential.entities.subaudiences,
    audienceId,
  );
  const comchecks = filterComchecks(
    state.referential.entities.comchecks,
    audienceId,
  );
  const userCanUpdate = checkUserCanUpdate(state, ownProps);
  const stateCurrentSubaudience = R.path(
    ['exercise', exerciseId, 'audience', audienceId, 'current_subaudience'],
    state.screen,
  );
  const subaudienceId = stateCurrentSubaudience === undefined && subaudiences.length > 0
    ? R.head(subaudiences).subaudience_id
    : stateCurrentSubaudience;
  const subaudience = subaudienceId
    ? R.find((a) => a.subaudience_id === subaudienceId)(subaudiences)
    : undefined;
  return {
    userCanUpdate,
    exerciseId,
    audienceId,
    audience,
    audiences,
    subaudience,
    subaudiences,
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
    fetchSubaudiences,
    fetchOrganizations,
    fetchComchecks,
  }),
  withStyles(styles),
)(IndexAudience);
