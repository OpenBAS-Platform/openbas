import React, {PropTypes} from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import CircularProgress from 'material-ui/CircularProgress';

const spinnerStyle = (props) => {
  return {
    roundSpinner: {
      display: props.show === true ? "inline-block" : "none",
      position: 'relative'
    },
    circularSpinner: {
      display: props.show === true ? "block" : "none",
      textAlign: "center"
    }
  }
};
export const RoundSpinner = (props) => (
  <div style={spinnerStyle(props).roundSpinner}>
    <RefreshIndicator size={40} left={0} top={0} status="loading"/>
  </div>
)

RoundSpinner.propTypes = {
  show: PropTypes.bool
}

export const CircularSpinner = (props) => (
  <div style={spinnerStyle(props).circularSpinner}>
    <CircularProgress size={props.size}/>
  </div>
)

CircularSpinner.propTypes = {
  show: PropTypes.bool,
  size: PropTypes.number
}