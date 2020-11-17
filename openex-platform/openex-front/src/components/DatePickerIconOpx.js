import React, { Component } from "react";
import { Icon } from "./Icon";
import * as Constants from "../constants/ComponentTypes";
import { FormField } from "./Field";
import DatePickerOpx from "./DatePickerOpx";
import PropTypes from "prop-types";

const styles = {
  newInputDate: {
    iconCalendar: {
      cursor: "pointer",
    },
    inputOnlyDateField: {
      display: "inline-block",
      width: "90%",
      marginLeft: "4%",
      verticalAlign: "middle",
    },
    inputOnlyDateIcon: {
      display: "inline-block",
      width: "5%",
      verticalAlign: "middle",
    },
    inputDateColumn: {
      display: "inline-block",
      width: "48%",
      verticalAlign: "middle",
    },
  },
};

class DatePickerIconOpx extends Component {
  refDatePicker = React.createRef();

  raiseDatePicker() {
    this.refDatePicker.current.openDialog();
  }

  render() {
    return (
      <div style={styles.newInputDate.inputDateColumn}>
        <div style={styles.newInputDate.inputOnlyDateIcon}>
          <span
            style={styles.newInputDate.iconCalendar}
            onClick={this.raiseDatePicker.bind(this)}
          >
            <Icon name={Constants.ICON_NAME_DATE_RANGE} />
          </span>
        </div>
        <div style={styles.newInputDate.inputOnlyDateField}>
          <FormField
            fullWidth={true}
            onChange={this.handleChange}
            name={this.props.nameField}
            type="text"
            label={this.props.labelField}
            hint="JJ/MM/AAAA"
          />
          <DatePickerOpx
            datePickerRef={this.refDatePicker}
            handleResult={this.props.onChange}
            defaultDate={this.props.defaultDate}
          />
        </div>
      </div>
    );
  }
}

DatePickerIconOpx.propTypes = {
  onChange: PropTypes.func,
  defaultDate: PropTypes.string,
};

export default DatePickerIconOpx;
