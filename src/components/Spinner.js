import React, {PropTypes} from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import CircularProgress from 'material-ui/CircularProgress';

export const RoundSpinner = () => (
    <RefreshIndicator size={40} left={0} top={0} status="loading"/>
)

const style = {
  margin: '0 auto',
  marginTop: 10,
  textAlign: 'center'
}

RoundSpinner.propTypes = {
  show: PropTypes.bool
}

export const CircularSpinner = (props) => (
    <div style={style}><CircularProgress color="#FFFFFF" size={props.size}/></div>
)

CircularSpinner.propTypes = {
  show: PropTypes.bool,
  size: PropTypes.number
}