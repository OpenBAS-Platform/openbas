import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import * as R from 'ramda'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchEvents} from '../../../../actions/Event'
import {fetchGroups} from '../../../../actions/Group'
import {Icon} from '../../../../components/Icon'
import {List} from '../../../../components/List'
import {MainListItemLink} from '../../../../components/list/ListItem'
import CreateEvent from './event/CreateEvent'

const styles = {
  container: {
    textAlign: 'left'
  },
  'empty': {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'title': {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase'
  }
}

i18nRegister({
  fr: {
    'Events': 'Evénements',
    'You do not have any events in this exercise.': 'Vous n\'avez aucun événement dans cet exercice.'
  }
})

class IndexScenario extends Component {
  componentDidMount() {
    this.props.fetchEvents(this.props.exerciseId);
    this.props.fetchGroups()
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.title}><T>Events</T></div>
        <div className="clearfix"></div>
        {this.props.events.length === 0 ?<div style={styles.empty}><T>You do not have any events in this exercise.</T></div> : ""}
        <List>
          {this.props.events.map(event => {
            return (
              <MainListItemLink
                to={'/private/exercise/' + this.props.exerciseId + '/scenario/' + event.event_id}
                key={event.event_id}
                leftIcon={<Icon name={Constants.ICON_NAME_ACTION_EVENT}/>}
                primaryText={
                  <div>
                    {event.event_title}
                  </div>
                }
                secondaryText={event.event_description}
                rightIcon={<Icon name={Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_RIGHT}/>}
              />
            )
          })}
        </List>

        {this.props.userCanUpdate ?
          <CreateEvent exerciseId={this.props.exerciseId}/>
          : ""
        }
      </div>
    )
  }
}

IndexScenario.propTypes = {
  exerciseId: PropTypes.string,
  events: PropTypes.array,
  fetchGroups: PropTypes.func,
  fetchEvents: PropTypes.func.isRequired,
  userCanUpdate: PropTypes.bool
}

const filteredEvents = (events, exerciseId) => {
  let eventsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.event_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.event_order > b.event_order)
  )
  return eventsFilterAndSorting(events)
}

const checkUserCanUpdate = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let userId = R.path(['logged', 'user'], state.app)
  let isAdmin = R.path([userId, 'user_admin'], state.referential.entities.users)

  let userCanUpdate = isAdmin
  if (!userCanUpdate) {
    let groupValues = R.values(state.referential.entities.groups)
    groupValues.forEach((group) => {
      group.group_grants.forEach((grant) => {
        if (
          grant
          && grant.grant_exercise
          && (grant.grant_exercise.exercise_id === exerciseId)
          && (grant.grant_name === 'PLANNER')
        ) {
          group.group_users.forEach((user) => {
            if (user && (user.user_id === userId)) {
              userCanUpdate = true
            }
          })
        }
      })
    })
  }

  return userCanUpdate
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let events = filteredEvents(state.referential.entities.events, exerciseId)
  let userCanUpdate = checkUserCanUpdate(state, ownProps)

  return {
    exerciseId,
    events,
    userCanUpdate,
  }
}

export default connect(select, {
  fetchEvents,
  fetchGroups
})(IndexScenario);
