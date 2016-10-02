import React, {PropTypes} from 'react';
import {
  Table as MUITable,
  TableBody as MUITableBody,
  TableHeader as MUITableHeader,
  TableHeaderColumn as MUITableHeaderColumn,
  TableRow as MUITableRow,
  TableRowColumn as MUITableRowColumn
} from 'material-ui/Table';

export const Table = (props) => (
  <MUITable selectable={props.selectable} multiSelectable={props.multiSelectable} {...props}>{props.children}</MUITable>
)

Table.propTypes = {
  children: PropTypes.node,
  selectable: PropTypes.bool,
  multiSelectable: PropTypes.bool
}

export const TableBody = (props) => (
  <MUITableBody {...props}>{props.children}</MUITableBody>
)

TableBody.propTypes = {
  children: PropTypes.node,
}

export const TableHeader = (props) => (
  <MUITableHeader {...props}>{props.children}</MUITableHeader>
)

TableHeader.propTypes = {
  children: PropTypes.node,
}

export const TableHeaderColumn = (props) => (
  <MUITableHeaderColumn {...props}>{props.children}</MUITableHeaderColumn>
)

TableHeaderColumn.propTypes = {
  children: PropTypes.node,
}

export const TableRow = (props) => (
  <MUITableRow hovered={true} {...props}>{props.children}</MUITableRow>
)

TableRow.propTypes = {
  children: PropTypes.node
}

export const TableRowColumn = (props) => (
  <MUITableRowColumn {...props}>{props.children}</MUITableRowColumn>
)

TableRowColumn.propTypes = {
  children: PropTypes.node,
}