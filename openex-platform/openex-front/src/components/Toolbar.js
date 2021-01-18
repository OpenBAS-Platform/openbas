import React from 'react';
import * as PropTypes from 'prop-types';
import MUIToolbar from '@material-ui/core/Toolbar';
import Theme from './Theme';
import * as Constants from '../constants/ComponentTypes';

const toolbarStyle = {
  [Constants.TOOLBAR_TYPE_LOGIN]: {
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    backgroundColor: Theme.palette.primary.main,
    minHeight: 55,
  },
  [Constants.TOOLBAR_TYPE_EVENT]: {
    position: 'fixed',
    top: 0,
    right: 320,
    zIndex: '5000',
    backgroundColor: 'none',
  },
  [Constants.TOOLBAR_TYPE_AUDIENCE]: {
    position: 'fixed',
    top: 0,
    right: 320,
    zIndex: '5000',
    backgroundColor: 'none',
  },
};

// eslint-disable-next-line import/prefer-default-export
export const Toolbar = (props) => (
  <MUIToolbar style={toolbarStyle[props.type]} {...props}>
    {props.children}
  </MUIToolbar>
);

Toolbar.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string,
};
