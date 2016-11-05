import React, {PropTypes} from 'react';
import MUISnackbar from 'material-ui/Snackbar';
import * as Constants from "../constants/ComponentTypes";

const snackbarStyle = {
}

export const Snackbar = (props) => (
  <MUISnackbar
    open={props.open}
    message={props.message}
    bodyStyle={snackbarStyle[props.type]}
  />
)

Snackbar.propTypes = {
  open: PropTypes.bool,
  type: PropTypes.string,
  message: PropTypes.node
}