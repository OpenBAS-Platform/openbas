import React, {PropTypes} from 'react';
import MUIDatePicker from 'material-ui/DatePicker';
import {Field} from 'redux-form'
import {injectIntl} from 'react-intl'
import moment from 'moment'

const style = {
  float: 'left',
}

const renderDatePicker = ({input, hintText, floatingLabelText, name, meta: {touched, error}}) => (
  <MUIDatePicker
    hintText={hintText}
    floatingLabelText={floatingLabelText}
    errorText={touched && error}
    name={name}
    autoOk={true}
    mode="landscape"
    onChange={(e, val) => {input.onChange(moment(val).format('YYYY-MM-DD'))}}
    textFieldStyle={style}
  />
)

renderDatePicker.propTypes = {
  input: PropTypes.object,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  name: PropTypes.string.isRequired,
  meta: PropTypes.object,
}

export const FormDatePickerIntl = (props) => (
  <Field name={props.name}
         hintText={props.hintText ? props.intl.formatMessage({id: props.hintText}) : ''}
         floatingLabelText={props.floatingLabelText ? props.intl.formatMessage({id: props.floatingLabelText}) : ''}
         onChange={props.onChange}
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
}