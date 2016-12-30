import React, {PropTypes} from 'react';
import CircularProgress from 'material-ui/CircularProgress';
import * as Constants from '../constants/ComponentTypes'

const styles = {
  [ Constants.SPINNER_TYPE_NAV ]: {
    margin: '10px 0 0 8px',
    textAlign: 'center'
  }
}

export const CircularSpinner = (props) => (
    <div style={styles[props.type]}><CircularProgress color={props.color} size={props.size}/></div>
)

CircularSpinner.propTypes = {
  show: PropTypes.bool,
  size: PropTypes.number,
  type: PropTypes.string,
  color: PropTypes.string
}