import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import { injectIntl } from 'react-intl';
import { dayFormat, timeFormat, parse } from '../utils/Time';

const styles = {
  global: {
    display: 'none',
  },
  picker: {
    position: 'absolute',
    top: '40px',
  },
};

class DateTimePicker extends Component {
  constructor(props) {
    super(props);
    this.state = { datetime: parse(this.props.defaultDate).toDate() };
  }

  handleDateChange(event, date) {
    const buildDateStr = dayFormat(date);
    this.setState({ datetime: parse(buildDateStr).toDate() });
    this.props.handleResult(buildDateStr);
  }

  handleTimeChange(event, time) {
    const buildDateStr = timeFormat(time);
    this.props.handleResult(buildDateStr);
  }

  render() {
    return (
      <div>
        <DatePicker
          autoOk={true}
          mode="landscape"
          name="Date"
          ref="datePicker"
          value={this.state.datetime}
          DateTimeFormat={global.Intl.DateTimeFormat}
          onChange={this.handleDateChange.bind(this)}
          floatingLabelText="Date"
          locale={this.props.intl.locale}
          cancelLabel={this.props.intl.formatMessage({ id: 'Cancel' })}
          style={styles.global}
          dialogContainerStyle={{ zIndex: 2100 }}
        />

        <TimePicker
          name="Time"
          autoOk={true}
          format="24hr"
          ref="timePicker"
          value={this.state.datetime}
          onChange={this.handleTimeChange.bind(this)}
          cancelLabel={this.props.intl.formatMessage({ id: 'Cancel' })}
          floatingLabelText="Time"
          okLabel={<div style={{ display: 'none' }}></div>}
          style={styles.global}
          dialogStyle={{ zIndex: 2100 }}
        />
      </div>
    );
  }
}

DateTimePicker.propTypes = {
  handleResult: PropTypes.func,
  defaultDate: PropTypes.string,
  intl: PropTypes.object,
};

export default injectIntl(DateTimePicker, { withRef: true });
