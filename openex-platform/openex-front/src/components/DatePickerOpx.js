import React, { Component } from 'react';
import DatePicker from '@material-ui/pickers/DatePicker';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { dayFormat } from '../utils/Time';

const styles = {
  global: {
    display: 'none',
  },
  picker: {
    position: 'absolute',
    top: '40px',
  },
};

class DatePickerOpx extends Component {
  handleChange(event, date) {
    this.props.handleResult(dayFormat(date));
  }

  render() {
    return (
      <DatePicker
        autoOk={true}
        mode="landscape"
        name="Date"
        ref={this.props.datePickerRef}
        value={this.props.defaultDate}
        DateTimeFormat={global.Intl.DateTimeFormat}
        onChange={this.handleChange}
        floatingLabelText="Date"
        locale={this.props.intl.locale}
        cancelLabel={this.props.intl.formatMessage({ id: 'Cancel' })}
        style={styles.global}
        dialogContainerStyle={{ zIndex: 2100 }}
      />
    );
  }
}

DatePickerOpx.propTypes = {
  handleResult: PropTypes.func,
  defaultDate: PropTypes.string,
  datePickerRef: PropTypes.object,
  intl: PropTypes.object,
};

export default injectIntl(DatePickerOpx, { withRef: true });
