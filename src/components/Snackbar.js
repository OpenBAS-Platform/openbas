import React, {PropTypes} from 'react';
import MUISnackbar from 'material-ui/Snackbar';

export const Snackbar = (props) => (
  <MUISnackbar
    open={props.open}
    message={props.message}
  />
)

Snackbar.propTypes = {
  open: PropTypes.bool,
  message: PropTypes.node
}