import React, {PropTypes} from 'react';
import MUITimePicker from 'material-ui/TimePicker';
import {Field} from 'redux-form'
import {injectIntl} from 'react-intl'
import moment from 'momentjs'

const style = {
  float: 'right',
}

const renderTimePicker = ({input, hintText, floatingLabelText, name, meta: {touched, error}}) => (
  <MUITimePicker
    hintText={hintText}
    floatingLabelText={floatingLabelText}
    errorText={touched && error}
    name={name}
    autoOk={true}
    format="24hr"
    onChange={(e, val) => {input.onChange(moment(val).format('HH:mm:ss'))}}
    textFieldStyle={style}
  />
)

renderTimePicker.propTypes = {
  input: PropTypes.object,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  name: PropTypes.string.isRequired,
  meta: PropTypes.object,
}

export const FormTimePickerIntl = (props) => (
  <Field name={props.name}
         hintText={props.hintText ? props.intl.formatMessage({id: props.hintText}) : ''}
         floatingLabelText={props.floatingLabelText ? props.intl.formatMessage({id: props.floatingLabelText}) : ''}
         onChange={props.onChange}
         component={renderTimePicker}
  />
)

export const TimePicker = injectIntl(FormTimePickerIntl)

FormTimePickerIntl.propTypes = {
  name: PropTypes.string.isRequired,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  intl: PropTypes.object,
  onChange: PropTypes.func,
}