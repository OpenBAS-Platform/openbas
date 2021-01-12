import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as Constants from '../constants/ComponentTypes';

const styles = {
  [Constants.SPINNER_TYPE_NAV]: {
    margin: '10px 0 0 8px',
    textAlign: 'center',
  },
  [Constants.SPINNER_TYPE_INJECT]: {
    top: 8,
    margin: 12,
    left: 4,
    padding: 0,
    position: 'absolute',
  },
};

// eslint-disable-next-line import/prefer-default-export
export const CircularSpinner = (props) => (
  <div style={styles[props.type]}>
    <CircularProgress color={props.color} size={props.size} />
  </div>
);

CircularSpinner.propTypes = {
  show: PropTypes.bool,
  size: PropTypes.number,
  type: PropTypes.string,
  color: PropTypes.string,
};
