import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import * as R from 'ramda';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import PropTypes from 'prop-types';
import { timeDiff } from '../utils/Time';

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
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState({
      [name]: value,
    });
  }

  getAllInject() {
    const allInject = R.pipe(
      R.values,
      R.sort((a, b) => timeDiff(a.inject_date, b.inject_date)),
    )(this.props.injects);
    return allInject;
  }

  render() {
    return (
      <Table
        height={this.state.height}
        fixedHeader={this.state.fixedHeader}
        fixedFooter={this.state.fixedFooter}
        selectable={this.state.selectable}
        multiSelectable={this.state.multiSelectable}
      >
        <TableHead
          displaySelectAll={this.state.showCheckboxes}
          adjustForCheckbox={this.state.showCheckboxes}
          enableSelectAll={this.state.enableSelectAll}
        >
          <TableRow>
            <TableCell tooltip="title">Titre</TableCell>
            <TableCell tooltip="type">Type</TableCell>
            <TableCell tooltip="date">Date et Heure</TableCell>
          </TableRow>
        </TableHead>
        <TableBody
          displayRowCheckbox={this.state.showCheckboxes}
          deselectOnClickaway={this.state.deselectOnClickaway}
          showRowHover={this.state.showRowHover}
          stripedRows={this.state.stripedRows}
        >
          {this.getAllInject().map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.inject_title}</TableCell>
              <TableCell>{row.inject_type}</TableCell>
              <TableCell>
                {`${new Date(row.inject_date).toLocaleDateString(
                  'fr-FR',
                )} ${new Date(row.inject_date).toLocaleTimeString('fr-FR')}`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

InjectTable.propTypes = {
  injects: PropTypes.object,
  intl: PropTypes.object,
};

export default injectIntl(InjectTable, { withRef: true });
