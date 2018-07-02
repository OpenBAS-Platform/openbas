import React from 'react'
import PropTypes from 'prop-types'
import MUISnackbar from 'material-ui/Snackbar';

export const Snackbar = (props) => (
  <MUISnackbar
    open={props.open}
    message={props.message}
    onRequestClose={props.onRequestClose}
    autoHideDuration={props.autoHideDuration}
  />
)

Snackbar.propTypes = {
  open: PropTypes.bool,
  message: PropTypes.node,
  onRequestClose: PropTypes.func,
  autoHideDuration: PropTypes.number
}