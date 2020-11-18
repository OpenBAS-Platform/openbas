import React from 'react';
import PropTypes from 'prop-types';
import MUILinearProgress from '@material-ui/core/LinearProgress';

export const LinearProgress = (props) => (
  <MUILinearProgress
    mode={props.mode}
    value={props.value}
    min={props.min}
    max={props.max}
  />
);

LinearProgress.propTypes = {
  mode: PropTypes.string,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
};
