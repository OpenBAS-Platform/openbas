import React, {PropTypes} from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export const MyTable = (props) => (
  <Table selectable={props.selectable} multiSelectable={props.multiSelectable}>{props.children}</Table>
)

MyTable.propTypes = {
  children: PropTypes.node,
  selectable: PropTypes.bool,
  multiSelectable: PropTypes.bool
}

export const MyTableBody = (props) => (
  <TableBody>{props.children}</TableBody>
)

MyTableBody.propTypes = {
  children: PropTypes.node,
}

export const MyTableHeader = (props) => (
  <TableHeader>{props.children}</TableHeader>
)

MyTableHeader.propTypes = {
  children: PropTypes.node,
}

export const MyTableHeaderColumn = (props) => (
  <TableHeaderColumn>{props.children}</TableHeaderColumn>
)

MyTableHeaderColumn.propTypes = {
  children: PropTypes.node,
}

export const MyTableRow = (props) => (
  <TableRow hovered={true}>{props.children}</TableRow>
)

MyTableRow.propTypes = {
  children: PropTypes.node
}

export const MyTableRowColumn = (props) => (
  <TableRowColumn>{props.children}</TableRowColumn>
)

MyTableRowColumn.propTypes = {
  children: PropTypes.node,
}