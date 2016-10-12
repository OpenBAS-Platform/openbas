import React, {PropTypes} from 'react';
import MUIDialog from 'material-ui/Dialog';
import {injectIntl} from 'react-intl'

export const DialogIntl = (props) => (
  <MUIDialog
    title={props.title ? props.intl.formatMessage({id: props.title}) : undefined}
    modal={props.modal}
    open={props.open}
    onRequestClose={props.onRequestClose}
    actions={props.actions}
  >
    {props.children}
  </MUIDialog>
)
export const Dialog = injectIntl(DialogIntl)

DialogIntl.propTypes = {
  title: PropTypes.string,
  modal: PropTypes.bool,
  open: PropTypes.bool,
  onRequestClose: PropTypes.func,
  intl: PropTypes.object,
  actions: PropTypes.node,
  children: PropTypes.node
}