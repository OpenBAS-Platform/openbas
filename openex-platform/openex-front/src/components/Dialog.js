import React from 'react';
import * as PropTypes from 'prop-types';
import MUIDialog from '@material-ui/core/Dialog';
import { injectIntl } from 'react-intl';

export const DialogIntl = (props) => (
  <MUIDialog
    title={
      props.title ? props.intl.formatMessage({ id: props.title }) : undefined
    }
    modal={props.modal}
    open={props.open}
    contentStyle={props.contentStyle}
    style={{ zIndex: 2000 }}
    onRequestClose={props.onRequestClose}
    autoScrollBodyContent={props.autoScrollBodyContent}
    actions={props.actions}
  >
    {props.children}
  </MUIDialog>
);
export const Dialog = injectIntl(DialogIntl);

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
};

export const DialogTitleElementIntl = (props) => (
  <MUIDialog
    title={props.title}
    modal={props.modal}
    open={props.open}
    contentStyle={props.contentStyle}
    bodyStyle={props.bodyStyle}
    style={{ zIndex: 2000 }}
    autoDetectWindowHeight={props.autoDetectWindowHeight}
    onRequestClose={props.onRequestClose}
    autoScrollBodyContent={props.autoScrollBodyContent}
    actions={props.actions}
  >
    {props.children}
  </MUIDialog>
);
export const DialogTitleElement = injectIntl(DialogTitleElementIntl);

DialogTitleElementIntl.propTypes = {
  title: PropTypes.node,
  modal: PropTypes.bool,
  open: PropTypes.bool,
  onRequestClose: PropTypes.func,
  intl: PropTypes.object,
  autoScrollBodyContent: PropTypes.bool,
  autoDetectWindowHeight: PropTypes.bool,
  actions: PropTypes.node,
  children: PropTypes.node,
  contentStyle: PropTypes.object,
  bodyStyle: PropTypes.object,
  style: PropTypes.object,
};
