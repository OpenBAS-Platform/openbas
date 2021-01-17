import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { green, red } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';
import { GroupOutlined, KeyboardArrowRightOutlined } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { fetchAudiences } from '../../../../actions/Audience';
import { fetchGroups } from '../../../../actions/Group';
import { SearchField } from '../../../../components/SearchField';
import CreateAudience from './audience/CreateAudience';

const styles = () => ({
  search: {
    float: 'right',
  },
  enabled: {
    color: green[500],
  },
  disabled: {
    color: red[500],
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
});

i18nRegister({
  fr: {
    Audiences: 'Audiences',
    'You do not have any audiences in this exercise.':
      "Vous n'avez aucune audience dans cet exercice.",
    players: 'joueurs',
  },
});

class IndexAudiences extends Component {
  constructor(props) {
    super(props);
    this.state = { searchTerm: '' };
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
    this.props.fetchGroups();
  }

  handleSearchAudiences(event) {
    this.setState({ searchTerm: event.target.value });
  }

  render() {
    const { classes, audiences } = this.props;
    const { searchTerm } = this.state;
    const filterByKeyword = (n) => searchTerm === ''
      || n.audience_name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
    const filteredAudiences = R.filter(filterByKeyword, audiences);
    return (
      <div className={classes.container}>
        <div>
          <Typography variant="h5" style={{ float: 'left' }}>
            <T>Audiences</T>
          </Typography>
          <div className={classes.search}>
            <SearchField onChange={this.handleSearchAudiences.bind(this)} />
          </div>
          <div className="clearfix" />
        </div>
        {this.props.audiences.length === 0 && (
          <div className={classes.empty}>
            <T>You do not have any audiences in this exercise.</T>
          </div>
        )}
        <List>
          {filteredAudiences.map((audience) => (
            <ListItem
              key={audience.audience_id}
              component={Link}
              button={true}
              to={`/private/exercise/${this.props.exerciseId}/audiences/${audience.audience_id}`}
              divider={true}
            >
              <ListItemIcon
                className={
                  audience.audience_enabled ? classes.enabled : classes.disabled
                }
              >
                <GroupOutlined />
              </ListItemIcon>
              <ListItemText
                primary={audience.audience_name}
                secondary={
                  <span>
                    {audience.audience_users_number} <T>players</T>
                  </span>
                }
              />
              <ListItemSecondaryAction>
                <KeyboardArrowRightOutlined />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {this.props.userCanUpdate && (
          <CreateAudience exerciseId={this.props.exerciseId} />
        )}
      </div>
    );
  }
}

IndexAudiences.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  fetchGroups: PropTypes.func,
  fetchAudiences: PropTypes.func.isRequired,
  userCanUpdate: PropTypes.bool,
};

const filteredAudiences = (audiences, exerciseId) => {
  const audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name)),
  );
  return audiencesFilterAndSorting(audiences);
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
  const { id: exerciseId } = ownProps;
  const audiences = filteredAudiences(
    state.referential.entities.audiences,
    exerciseId,
  );
  const userCanUpdate = checkUserCanUpdate(state, ownProps);
  return {
    exerciseId,
    audiences,
    userCanUpdate,
  };
};

export default R.compose(
  connect(select, {
    fetchAudiences,
    fetchGroups,
  }),
  withStyles(styles),
)(IndexAudiences);
