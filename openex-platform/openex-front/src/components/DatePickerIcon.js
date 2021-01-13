import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { FormField } from './Field';
import { Icon } from './Icon';
import * as Constants from '../constants/ComponentTypes';
import DateTimePicker from './DateTimePicker';

const styles = {
  newInputDate: {
    iconCalendar: {
      cursor: 'pointer',
    },
    inputOnlyDateField: {
      display: 'inline-block',
      width: '95%',
      verticalAlign: 'middle',
    },
    inputOnlyDateIcon: {
      display: 'inline-block',
      width: '5%',
      verticalAlign: 'middle',
    },
    inputOnlyTimeField: {
      display: 'inline-block',
      width: '95%',
      verticalAlign: 'middle',
    },
    inputOnlyTimeIcon: {
      display: 'inline-block',
      width: '5%',
      verticalAlign: 'middle',
    },
    inputDateTimeLine: {
      display: 'inline-block',
      width: '100%',
      verticalAlign: 'middle',
    },
    inputDateColumn: {
      display: 'inline-block',
      width: '48%',
      verticalAlign: 'middle',
    },
    inputTimeColumn: {
      display: 'inline-block',
      width: '48%',
      marginLeft: '4%',
      verticalAlign: 'middle',
    },
    inputDateIcon: {
      display: 'inline-block',
      width: '10%',
      verticalAlign: 'middle',
    },
    inputDateField: {
      display: 'inline-block',
      width: '90%',
      verticalAlign: 'middle',
    },
  },
  fullDate: {
    display: 'none',
  },
};

class DatePickerIcon extends Component {
  raiseDatePicker() {
    if (!this.refs.startDatePicker) {
      this.refs.endDatePicker.getWrappedInstance().refs.datePicker.openDialog();
    } else {
      this.refs.startDatePicker
        .getWrappedInstance()
        .refs.datePicker.openDialog();
    }
  }

  raiseTimePicker() {
    if (!this.refs.startTimePicker) {
      this.refs.endTimePicker.getWrappedInstance().refs.timePicker.openDialog();
    } else {
      this.refs.startTimePicker
        .getWrappedInstance()
        .refs.timePicker.openDialog();
    }
  }

  render() {
    if (this.props.enableDate && !this.props.enableTime) {
      return (
        <div style={styles.newInputDate.inputDateTimeLine}>
          <div style={styles.newInputDate.inputOnlyDateIcon}>
            <span
              style={styles.newInputDate.iconCalendar}
              ref={this.props.refIconDateOnly}
              handleResult={this.props.replaceStartDateValue}
              onClick={this.raiseDatePicker.bind(this)}
            >
              <Icon name={Constants.ICON_NAME_DATE_RANGE} />
            </span>
          </div>
          <div style={styles.newInputDate.inputOnlyDateField}>
            <FormField
              fullWidth={true}
              ref={this.props.refFieldDateOnly}
              onChange={this.handleChange}
              name={this.props.nameFieldDateOnly}
              type="text"
              label={this.props.labelFieldDateOnly}
              hint="JJ/MM/AAAA"
            />
            <DateTimePicker
              ref={this.props.refIconDateOnly}
              handleResult={this.props.replaceStartDateValue}
              onClick={this.raiseDatePicker.bind(this)}
              defaultDate={this.props.defaultDate}
            />
          </div>
        </div>
      );
    }
    if (!this.props.enableDate && this.props.enableTime) {
      return (
        <div style={styles.newInputDate.inputDateTimeLine}>
          <div style={styles.newInputDate.inputOnlyTimeIcon}>
            <span
              style={styles.newInputDate.iconCalendar}
              ref={this.props.refIconTime}
              handleResult={this.props.replaceStartTimeValue}
              onClick={this.raiseTimePicker.bind(this)}
            >
              <Icon name={Constants.ICON_NAME_ACCESS_TIME} />
            </span>
          </div>
          <div style={styles.newInputDate.inputOnlyTimeField}>
            <FormField
              fullWidth={true}
              ref={this.props.refFieldTime}
              onChange={this.handleChange}
              name={this.props.nameFieldTime}
              type="text"
              label={this.props.labelFieldTime}
              hint="HH:MM"
            />
            <DateTimePicker
              ref={this.props.refIconTime}
              handleResult={this.props.replaceStartTimeValue}
              onClick={this.raiseTimePicker.bind(this)}
              defaultDate={this.props.defaultTime}
            />
          </div>
        </div>
      );
    }
    return (
      <div style={styles.newInputDate.inputDateTimeLine}>
        <div style={styles.newInputDate.inputDateColumn}>
          <div style={styles.newInputDate.inputDateIcon}>
            <span
              style={styles.newInputDate.iconCalendar}
              ref={this.props.refIconDateOnly}
              handleResult={this.props.replaceStartDateValue}
              onClick={this.raiseDatePicker.bind(this)}
            >
              <Icon name={Constants.ICON_NAME_DATE_RANGE} />
            </span>
          </div>
          <div style={styles.newInputDate.inputDateField}>
            <FormField
              fullWidth={true}
              ref={this.props.refFieldDateOnly}
              onChange={this.handleChange}
              name={this.props.nameFieldDateOnly}
              type="text"
              label={this.props.labelFieldDateOnly}
              hint="JJ/MM/AAAA"
            />
            <DateTimePicker
              ref={this.props.refIconDateOnly}
              handleResult={this.props.replaceStartDateValue}
              onClick={this.raiseDatePicker.bind(this)}
              defaultDate={this.props.defaultDate}
            />
          </div>
        </div>

        <div style={styles.newInputDate.inputTimeColumn}>
          <div style={styles.newInputDate.inputDateIcon}>
            <span
              style={styles.newInputDate.iconCalendar}
              ref={this.props.refIconTime}
              handleResult={this.props.replaceStartTimeValue}
              onClick={this.raiseTimePicker.bind(this)}
            >
              <Icon name={Constants.ICON_NAME_ACCESS_TIME} />
            </span>
          </div>
          <div style={styles.newInputDate.inputDateField}>
            <FormField
              fullWidth={true}
              ref={this.props.refFieldTime}
              onChange={this.handleChange}
              name={this.props.nameFieldTime}
              type="text"
              label={this.props.labelFieldTime}
              hint="HH:MM"
            />
            <DateTimePicker
              ref={this.props.refIconTime}
              handleResult={this.props.replaceStartTimeValue}
              onClick={this.raiseTimePicker.bind(this)}
              defaultDate={this.props.defaultTime}
            />
          </div>
        </div>

        <div style={styles.fullDate}>
          <FormField
            ref={this.props.nameFullDate}
            name={this.props.nameFullDate}
            type="hidden"
          />
        </div>
      </div>
    );
  }
}

DatePickerIcon.propTypes = {
  refIconDateOnly: PropTypes.string,
  defaultDate: PropTypes.string,
  intl: PropTypes.object,
};

export default injectIntl(DatePickerIcon);
