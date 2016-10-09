import React, {PropTypes} from 'react';
import MUIPaper from 'material-ui/Paper';
import * as Constants from "../constants/ComponentTypes";

const paperStyle = {
  [ Constants.PAPER_TYPE_EXERCISE ]: {
    display: 'inline-block',
    margin: '20px 20px 20px 20px',
    verticalAlign: 'top',
    width: 400,
    height: 256,
    cursor: 'pointer'
  }
}

export const Paper = (props) => (
  <MUIPaper rounded={true} style={paperStyle[props.type]} className={props.className}>{props.children}</MUIPaper>
)

Paper.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
}