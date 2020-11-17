import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { T } from '../../../../../components/I18n';
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
  type: {
    color: Theme.palette.disabledColor,
    fontSize: '14px',
    margin: '0px 0px 10px 0px',
  },
  story: {},
};

class IncidentView extends Component {
  render() {
    const incident_type = R.propOr('-', 'incident_type', this.props.incident);
    const incident_type_name = R.pathOr(
      '-',
      [incident_type, 'type_name'],
      this.props.incident_types,
    );
    const incident_story = R.propOr('-', 'incident_story', this.props.incident);
    return (
      <div style={styles.container}>
        <div style={styles.type}>
          <T>{incident_type_name}</T>
        </div>
        <div style={styles.story}>{incident_story}</div>
      </div>
    );
  }
}

IncidentView.propTypes = {
  incident: PropTypes.object,
  incident_types: PropTypes.object,
};

export default IncidentView;
