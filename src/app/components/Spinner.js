import React, {PropTypes} from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import CircularProgress from 'material-ui/CircularProgress';

export const RoundSpinner = () => (
    <RefreshIndicator size={40} left={0} top={0} status="loading"/>
)

RoundSpinner.propTypes = {
  show: PropTypes.bool
}

export const CircularSpinner = (props) => (
    <CircularProgress size={props.size}/>
)

CircularSpinner.propTypes = {
  show: PropTypes.bool,
  size: PropTypes.number
}