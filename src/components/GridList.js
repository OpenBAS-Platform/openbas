import React, {PropTypes} from 'react';
import {GridList as MUIGridList, GridTile as MUIGridTile} from 'material-ui/GridList';
import * as Constants from '../constants/ComponentTypes'

const GridListStyle = {
  [ Constants.GRIDLIST_TYPE_GALLERY ]: {
    width: 700,
    height: 450,
    overflowY: 'auto',
  }
}

export const GridList = (props) => (
  <MUIGridList
    cellHeight={props.cellHeight}
    cols={props.cols}
    padding={props.padding}
    style={GridListStyle[props.type]}
  >
    {props.children}
  </MUIGridList>
)

GridList.propTypes = {
  children: PropTypes.node,
  cellHeight: PropTypes.number,
  cols: PropTypes.number,
  padding: PropTypes.number,
  type: PropTypes.string
}

export const GridTile = (props) => (
  <MUIGridTile
    title={props.title}
    subtitle={props.subtitle}
    actionIcon={props.actionIcon}
  >
    {props.children}
    </MUIGridTile>
)

GridTile.propTypes = {
  key: PropTypes.string,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actionIcon: PropTypes.element,
  children: PropTypes.node,
}