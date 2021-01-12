import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import Theme from '../../../../../components/Theme';

const styles = {
  container: {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '500',
  },
  story: {},
};

class EventView extends Component {
  render() {
    const eventDescription = R.propOr(
      '-',
      'event_description',
      this.props.event,
    );
    return (
      <div style={styles.container}>
        <div style={styles.story}>{eventDescription}</div>
      </div>
    );
  }
}

EventView.propTypes = {
  event: PropTypes.object,
};

export default EventView;
