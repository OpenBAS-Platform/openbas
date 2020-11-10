import React, {Component} from 'react'
import {injectIntl} from 'react-intl'
import * as R from 'ramda'
import {timeDiff} from '../utils/Time'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import PropTypes from 'prop-types'

class InjectTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fixedHeader: true,
      fixedFooter: false,
      stripedRows: false,
      showRowHover: false,
      selectable: false,
      multiSelectable: false,
      enableSelectAll: false,
      deselectOnClickaway: false,
      showCheckboxes: false,
      height: '160px',
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  getAllInject() {
    let allInject = R.pipe(
      R.values,
      R.sort((a, b) => timeDiff(a.inject_date, b.inject_date))
    )(this.props.injects)
    return allInject
  }

  render() {
    return (
      <Table height={this.state.height} fixedHeader={this.state.fixedHeader} fixedFooter={this.state.fixedFooter}
             selectable={this.state.selectable} multiSelectable={this.state.multiSelectable}>
        <TableHeader displaySelectAll={this.state.showCheckboxes} adjustForCheckbox={this.state.showCheckboxes}
                     enableSelectAll={this.state.enableSelectAll}>
          <TableRow>
            <TableHeaderColumn tooltip="title">Titre</TableHeaderColumn>
            <TableHeaderColumn tooltip="type">Type</TableHeaderColumn>
            <TableHeaderColumn tooltip="date">Date et Heure</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={this.state.showCheckboxes} deselectOnClickaway={this.state.deselectOnClickaway}
                   showRowHover={this.state.showRowHover} stripedRows={this.state.stripedRows}>
          {this.getAllInject().map((row, index) => (
            <TableRow key={index}>
              <TableRowColumn>{row.inject_title}</TableRowColumn>
              <TableRowColumn>{row.inject_type}</TableRowColumn>
              <TableRowColumn>{new Date(row.inject_date).toLocaleDateString('fr-FR')
              + ' ' + new Date(row.inject_date).toLocaleTimeString('fr-FR')}</TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}

InjectTable.propTypes = {
  injects: PropTypes.object,
  intl: PropTypes.object
}

export default injectIntl(InjectTable, {withRef: true})
