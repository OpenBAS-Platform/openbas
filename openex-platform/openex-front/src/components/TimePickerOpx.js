import React, { Component } from "react";
import TimePicker from "@material-ui/pickers/TimePicker";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import { timeFormat } from "../utils/Time";

const styles = {
  global: {
    display: "none",
  },
  picker: {
    position: "absolute",
    top: "40px",
  },
};

class TimePickerOpx extends Component {
  handleChange = (event, time) => {
    this.props.handleResult(timeFormat(time));
  };

  render() {
    return (
      <TimePicker
        name="Time"
        autoOk={true}
        format="24hr"
        ref={this.props.timePickerRef}
        value={this.props.defaultTime}
        onChange={this.handleChange}
        cancelLabel={this.props.intl.formatMessage({ id: "Cancel" })}
        floatingLabelText="Time"
        okLabel={<div style={{ display: "none" }}></div>}
        style={styles.global}
        dialogStyle={{ zIndex: 2100 }}
      />
    );
  }
}

TimePickerOpx.propTypes = {
  handleResult: PropTypes.func,
  defaultTime: PropTypes.string,
  timePickerRef: PropTypes.object,
  intl: PropTypes.object,
};

export default injectIntl(TimePickerOpx, { withRef: true });
