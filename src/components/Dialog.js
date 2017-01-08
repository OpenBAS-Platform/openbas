import React, {PropTypes} from 'react';
import MUIDialog from 'material-ui/Dialog'
import {injectIntl} from 'react-intl'

export const DialogIntl = (props) => (
  <MUIDialog
    title={props.title ? props.intl.formatMessage({id: props.title}) : undefined}
    modal={props.modal}
    open={props.open}
    contentStyle={props.contentStyle}
    style={props.style}
    onRequestClose={props.onRequestClose}
    autoScrollBodyContent={props.autoScrollBodyContent}
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
  autoScrollBodyContent: PropTypes.bool,
  actions: PropTypes.node,
  children: PropTypes.node,
  contentStyle: PropTypes.object,
  style: PropTypes.object
}

export const DialogTitleElementIntl = (props) => (
  <MUIDialog
    title={props.title}
    modal={props.modal}
    open={props.open}
    contentStyle={props.contentStyle}
    style={props.style}
    onRequestClose={props.onRequestClose}
    autoScrollBodyContent={props.autoScrollBodyContent}
    actions={props.actions}
  >
    {props.children}
  </MUIDialog>
)
export const DialogTitleElement = injectIntl(DialogTitleElementIntl)

DialogTitleElementIntl.propTypes = {
  title: PropTypes.node,
  modal: PropTypes.bool,
  open: PropTypes.bool,
  onRequestClose: PropTypes.func,
  intl: PropTypes.object,
  autoScrollBodyContent: PropTypes.bool,
  actions: PropTypes.node,
  children: PropTypes.node,
  contentStyle: PropTypes.object,
  style: PropTypes.object
}