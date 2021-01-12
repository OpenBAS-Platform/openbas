import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
    margin: '0px 0px 10px 0px',
  },
  story: {
    textAlign: 'justify',
  },
};

class SubobjectiveView extends Component {
  render() {
    const subobjectiveDescription = R.propOr(
      '-',
      'subobjective_description',
      this.props.subobjective,
    );
    return (
      <div style={styles.container}>
        <div style={styles.story}>{subobjectiveDescription}</div>
      </div>
    );
  }
}

SubobjectiveView.propTypes = {
  subobjective: PropTypes.object,
};

export default SubobjectiveView;
