import React from 'react';
import PropTypes from 'prop-types';
import MUIGridList from '@material-ui/core/GridList';
import MUIGridListTile from '@material-ui/core/GridListTile';
import * as Constants from '../constants/ComponentTypes';

const GridListStyle = {
  [Constants.GRIDLIST_TYPE_GALLERY]: {
    marginTop: '20px',
    width: '700px',
    height: '450px',
    overflowY: 'auto',
  },
};

export const GridList = (props) => (
  <MUIGridList
    cellHeight={props.cellHeight}
    cols={props.cols}
    padding={props.padding}
    style={GridListStyle[props.type]}
  >
    {props.children}
  </MUIGridList>
);

GridList.propTypes = {
  children: PropTypes.node,
  cellHeight: PropTypes.number,
  cols: PropTypes.number,
  padding: PropTypes.number,
  type: PropTypes.string,
};

export const GridTile = (props) => (
  <MUIGridListTile
    title={props.title}
    subtitle={props.subtitle}
    actionIcon={props.actionIcon}
  >
    {props.children}
  </MUIGridListTile>
);

GridTile.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actionIcon: PropTypes.element,
  children: PropTypes.node,
};
