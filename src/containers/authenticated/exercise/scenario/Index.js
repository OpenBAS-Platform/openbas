import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
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

class IndexScenario extends Component {
  componentDidMount() {
    this.props.fetchEvents(this.props.exerciseId);
  }

  render() {
    return (
      <div style={styles.container}>
        {this.props.events.length === 0 ?<div style={styles.empty}>You do not have any available events in this exercise.</div> : ""}
        {this.props.events.map(event => {
          return (
            <Link to={'/private/exercise/' + this.props.exerciseId + '/scenario/' + event.event_id} key={event.event_id}>
              <Event title={event.event_title} description={event.event_description} image={event.event_image.file_url} />
            </Link>
          )
        })}
        <CreateEvent exerciseId={this.props.exerciseId}/>
      </div>
    );
  }
}

IndexScenario.propTypes = {
  exerciseId: PropTypes.string,
  events: PropTypes.array,
  fetchEvents: PropTypes.func.isRequired,
}

const filteredEvents = (events, exerciseId) => {
  let eventsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.event_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.event_title.localeCompare(b.event_title))
  )
  return eventsFilterAndSorting(events)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let events = filteredEvents(state.referential.entities.events, exerciseId)

  return {
    exerciseId,
    events
  }
}

export default connect(select, {fetchEvents})(IndexScenario);