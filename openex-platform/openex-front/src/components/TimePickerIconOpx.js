import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from './Icon';
import * as Constants from '../constants/ComponentTypes';
import { TextField } from './TextField';
import TimePickerOpx from './TimePickerOpx';

const styles = {
  newInputDate: {
    iconCalendar: {
      cursor: 'pointer',
    },
    inputOnlyTimeField: {
      display: 'inline-block',
      width: '90%',
      verticalAlign: 'middle',
      marginLeft: '4%',
    },
    inputOnlyTimeIcon: {
      display: 'inline-block',
      width: '5%',
      verticalAlign: 'middle',
    },
    inputTimeColumn: {
      display: 'inline-block',
      width: '48%',
      marginLeft: '4%',
      verticalAlign: 'middle',
    },
  },
};

class TimePickerIconOpx extends Component {
  constructor(props) {
    super(props);
    this.refTimePicker = React.createRef();
  }

  raiseDatePicker() {
    this.refTimePicker.current.openDialog();
  }

  render() {
    return (
      <div style={styles.newInputDate.inputTimeColumn}>
        <div style={styles.newInputDate.inputOnlyTimeIcon}>
          <span
            style={styles.newInputDate.iconCalendar}
            onClick={this.raiseDatePicker.bind(this)}
          >
            <Icon name={Constants.ICON_NAME_ACCESS_TIME} />
          </span>
        </div>
        <div style={styles.newInputDate.inputOnlyTimeField}>
          <TextField
            fullWidth={true}
            onChange={this.handleChange}
            name={this.props.nameField}
            type="text"
            label={this.props.labelField}
            hint="HH:MM"
          />
          <TimePickerOpx
            timePickerRef={this.refTimePicker}
            handleResult={this.props.onChange}
            defaultTime={this.props.defaultTime}
          />
        </div>
      </div>
    );
  }
}

TimePickerIconOpx.propTypes = {
  onChange: PropTypes.func,
  defaultDate: PropTypes.string,
};

export default TimePickerIconOpx;
