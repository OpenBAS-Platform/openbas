import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import Theme from '../../../../components/Theme';

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

class OutcomeView extends Component {
  render() {
    const outcomeResult = R.pathOr(
      '-',
      ['incident_outcome', 'outcome_result'],
      this.props.incident,
    );
    const outcomeComment = R.pathOr(
      '-',
      ['incident_outcome', 'outcome_comment'],
      this.props.incident,
    );

    return (
      <div style={styles.container}>
        <div style={styles.title}>{outcomeResult}</div>
        <div style={styles.story}>{outcomeComment}</div>
      </div>
    );
  }
}

OutcomeView.propTypes = {
  incident: PropTypes.object,
};

export default OutcomeView;
