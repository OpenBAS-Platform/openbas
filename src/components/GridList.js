import React, {PropTypes} from 'react';
import {GridList as MUIGridList, GridTile as MUIGridTile} from 'material-ui/GridList';

export const GridList = (props) => (
  <MUIGridList
    cellHeight={props.cellHeight}
    cols={props.cols}
    padding={props.padding}
  >
    {props.children}
  </MUIGridList>
)

GridList.propTypes = {
  children: PropTypes.node,
  cellHeight: PropTypes.number,
  cols: PropTypes.number,
  padding: PropTypes.number
}

export const GridTile = (props) => (
  <MUIGridTile
    key={props.key}
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