import React, {PropTypes, Component} from 'react'
import R from 'ramda'
import Theme from '../../../../../components/Theme'

const styles = {
  'container': {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px'
  },
  'title': {
    fontSize: '16px',
    fontWeight: '500'
  },
  'story': {

  }
}

class EventView extends Component {

  render() {
    let event_title = R.propOr('-', 'event_title', this.props.event)
    let event_description = R.propOr('-', 'event_description', this.props.event)

    return (
      <div style={styles.container}>
        <div style={styles.title}>{event_title}</div>
        <div style={styles.story}>{event_description}</div>
      </div>
    )
  }
}

EventView.propTypes = {
  event: PropTypes.object
}

export default EventView