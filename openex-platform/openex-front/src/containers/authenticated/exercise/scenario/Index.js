import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { withStyles } from '@material-ui/core/styles';
import { EventOutlined, KeyboardArrowRightOutlined } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { fetchEvents } from '../../../../actions/Event';
import { fetchGroups } from '../../../../actions/Group';
import CreateEvent from './event/CreateEvent';

const styles = () => ({
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
});

i18nRegister({
  fr: {
    Events: 'Evénements',
    'You do not have any events in this exercise.':
      "Vous n'avez aucun événement dans cet exercice.",
  },
});

class IndexScenario extends Component {
  componentDidMount() {
    this.props.fetchEvents(this.props.exerciseId);
    this.props.fetchGroups();
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <Typography variant="h5" style={{ float: 'left' }}>
          <T>Events</T>
        </Typography>
        <div className="clearfix" />
        {this.props.events.length === 0 && (
          <div className={classes.empty}>
            <T>You do not have any events in this exercise.</T>
          </div>
        )}
        <List>
          {this.props.events.map((event) => (
            <ListItem
              key={event.event_id}
              component={Link}
              button={true}
              to={`/private/exercise/${this.props.exerciseId}/scenario/${event.event_id}`}
              divider={true}
            >
              <ListItemIcon>
                <EventOutlined />
              </ListItemIcon>
              <ListItemText
                primary={event.event_title}
                secondary={event.event_description}
              />
              <ListItemSecondaryAction>
                <KeyboardArrowRightOutlined />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {this.props.userCanUpdate && (
          <CreateEvent exerciseId={this.props.exerciseId} />
        )}
      </div>
    );
  }
}

IndexScenario.propTypes = {
  exerciseId: PropTypes.string,
  events: PropTypes.array,
  fetchGroups: PropTypes.func,
  fetchEvents: PropTypes.func.isRequired,
  userCanUpdate: PropTypes.bool,
};

const filteredEvents = (events, exerciseId) => {
  const eventsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.event_exercise.exercise_id === exerciseId),
    R.sortWith([R.ascend(R.prop('event_order'))]),
  );
  return eventsFilterAndSorting(events);
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
  const events = filteredEvents(state.referential.entities.events, exerciseId);
  const userCanUpdate = checkUserCanUpdate(state, ownProps);
  return {
    exerciseId,
    events,
    userCanUpdate,
  };
};

export default R.compose(
  connect(select, {
    fetchEvents,
    fetchGroups,
  }),
  withStyles(styles),
)(IndexScenario);
