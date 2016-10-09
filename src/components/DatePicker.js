import React, {PropTypes} from 'react';
import MUIDatePicker from 'material-ui/DatePicker';
import {Field} from 'redux-form'
import {injectIntl} from 'react-intl'
import moment from 'moment'

const style = {
  width: '50%',
  display: 'inline-block',
}

const renderDatePicker = ({input, hintText, floatingLabelText, name, defaultDate, meta: {touched, error}}) => (
  <MUIDatePicker
    hintText={hintText}
    floatingLabelText={floatingLabelText}
    errorText={touched && error}
    name={name}
    autoOk={true}
    mode="landscape"
    defaultDate={defaultDate}
    fullWidth={true}
    onChange={(e, val) => {input.onChange(moment(val).format('YYYY-MM-DD'))}}
    style={style}
  />
)

renderDatePicker.propTypes = {
  input: PropTypes.object,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  name: PropTypes.string.isRequired,
  meta: PropTypes.object,
  defaultDate: PropTypes.object
}

export const FormDatePickerIntl = (props) => (
  <Field name={props.name}
         hintText={props.hintText ? props.intl.formatMessage({id: props.hintText}) : ''}
         floatingLabelText={props.floatingLabelText ? props.intl.formatMessage({id: props.floatingLabelText}) : ''}
         onChange={props.onChange}
         defaultDate={props.defaultDate}
         component={renderDatePicker}
  />
)

export const DatePicker = injectIntl(FormDatePickerIntl)

FormDatePickerIntl.propTypes = {
  name: PropTypes.string.isRequired,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  intl: PropTypes.object,
  onChange: PropTypes.func,
  defaultDate: PropTypes.object
}