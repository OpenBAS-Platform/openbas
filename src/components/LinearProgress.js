import React, {PropTypes} from 'react';
import MUILinearProgress from 'material-ui/LinearProgress';

export const LinearProgress = (props) => (
  <MUILinearProgress mode={props.mode} value={props.value} min={props.min} max={props.max} />
)

LinearProgress.propTypes = {
  mode: PropTypes.string,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
}