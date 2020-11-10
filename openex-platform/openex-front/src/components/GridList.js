import React from 'react'
import PropTypes from 'prop-types'
import {GridList as MUIGridList, GridTile as MUIGridTile} from 'material-ui/GridList'
import * as Constants from '../constants/ComponentTypes'

const GridListStyle = {
  [ Constants.GRIDLIST_TYPE_GALLERY ]: {
    marginTop: '20px',
    width: '700px',
    height: '450px',
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
    actionIcon={props.actionIcon}>
    {props.children}
    </MUIGridTile>
)

GridTile.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actionIcon: PropTypes.element,
  children: PropTypes.node,
}