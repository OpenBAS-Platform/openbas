import React, {PropTypes} from 'react';
import MUIDatePicker from 'material-ui/DatePicker';
import {injectIntl} from 'react-intl'

const style = {
  float: 'left',
}

export const DatePickerIntl = (props) => (
  <MUIDatePicker hintText={props.intl.formatMessage({id: props.hintText})} style={style}/>
)
export const DatePicker = injectIntl(DatePickerIntl)

DatePickerIntl.propTypes = {
  hintText: PropTypes.string,
  intl: PropTypes.object
}