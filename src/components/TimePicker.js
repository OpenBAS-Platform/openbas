import React, {PropTypes} from 'react';
import MUITimePicker from 'material-ui/TimePicker';
import {injectIntl} from 'react-intl'

const style = {
  float: 'right',
}

export const TimePickerIntl = (props) => (
  <MUITimePicker hintText={props.intl.formatMessage({id: props.hintText})} onChange={props.onChange} style={style} />
)
export const TimePicker = injectIntl(TimePickerIntl)

TimePickerIntl.propTypes = {
  hintText: PropTypes.string,
  onChange: PropTypes.func,
  intl: PropTypes.object
}