import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {fromJS} from 'immutable'
import createImmutableSelector from '../../../../utils/ImmutableSelect'
import R from 'ramda'
import {fetchEvents} from '../../../../actions/Event'
import {Event} from '../../../../components/Event'
import CreateEvent from './event/CreateEvent'

const styles = {
  container: {
    textAlign: 'center'
  },
  'empty': {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
}

const filterEvents = (events, exerciseId) => {
  var filterByExercise = n => n.event_exercise === exerciseId
  var filteredEvents = R.filter(filterByExercise, events.toJS())
  return fromJS(filteredEvents)
}

class IndexScenario extends Component {
  componentDidMount() {
    this.props.fetchEvents(this.props.exerciseId);
  }

  render() {
    return (
      <div style={styles.container}>
        {this.props.events.count() === 0 ? <div style={styles.empty}>You do not have any available events in this exercise.</div>:""}
        {this.props.events.toList().map(event => {
          return (
            <Link to={'/private/exercise/' + this.props.exerciseId + '/scenario/' + event.get('event_id')} key={event.get('event_id')}>
              <Event
                title={event.get('event_title')}
                description={event.get('event_description')}
                image={event.get('event_image').get('file_url')}
              />
            </Link>
          )
        })}
        <CreateEvent exerciseId={this.props.exerciseId} />
      </div>
    );
  }
}

IndexScenario.propTypes = {
  exerciseId: PropTypes.string,
  events: PropTypes.object,
  fetchEvents: PropTypes.func.isRequired,
}

const filteredEvents = createImmutableSelector(
  (state, exerciseId) => filterEvents(state.application.getIn(['entities', 'events']), exerciseId),
  events => events)

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  return {
    exerciseId,
    events: filteredEvents(state, exerciseId)
  }
}

export default connect(select, {fetchEvents})(IndexScenario);