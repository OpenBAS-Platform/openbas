import React, {PropTypes} from 'react';
import MUIDatePicker from 'material-ui/DatePicker';
import {Field} from 'redux-form'
import {injectIntl} from 'react-intl'
import moment from 'moment'

const style = {
  width: '50%',
  display: 'inline-block',
}

const renderDatePicker = ({input, hintText, floatingLabelText, name, defaultDate, onChange, container, meta: {touched, error}}) => (
  <MUIDatePicker
    hintText={hintText}
    floatingLabelText={floatingLabelText}
    errorText={touched && error}
    name={name}
    autoOk={true}
    mode="landscape"
    container={container}
    defaultDate={defaultDate}
    fullWidth={true}
    onChange={(e, val) => {
      input.onChange(moment(val).format('YYYY-MM-DD'))
      onChange(e, val)
    }}
    style={style}
  />
)

renderDatePicker.propTypes = {
  input: PropTypes.object,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  name: PropTypes.string.isRequired,
  container: PropTypes.string,
  meta: PropTypes.object,
  defaultDate: PropTypes.object,
  onChange: PropTypes.func
}

export const FormDatePickerIntl = (props) => (
  <Field name={props.name}
         hintText={props.hintText ? props.intl.formatMessage({id: props.hintText}) : undefined}
         floatingLabelText={props.floatingLabelText ? props.intl.formatMessage({id: props.floatingLabelText}) : undefined}
         onChange={props.onChange}
         defaultDate={props.defaultDate}
         container={props.container}
         component={renderDatePicker}
  />
)

export const DatePicker = injectIntl(FormDatePickerIntl)

FormDatePickerIntl.propTypes = {
  name: PropTypes.string.isRequired,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  container: PropTypes.string,
  intl: PropTypes.object,
  onChange: PropTypes.func,
  defaultDate: PropTypes.object
}