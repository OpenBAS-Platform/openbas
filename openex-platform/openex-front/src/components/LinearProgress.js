import React from 'react';
import * as PropTypes from 'prop-types';
import MUILinearProgress from '@material-ui/core/LinearProgress';

// eslint-disable-next-line import/prefer-default-export
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
