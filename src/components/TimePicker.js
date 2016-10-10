import React, {PropTypes} from 'react';
import MUITimePicker from 'material-ui/TimePicker';
import {Field} from 'redux-form'
import {injectIntl} from 'react-intl'
import moment from 'moment'

const style = {
  width: '50%',
  display: 'inline-block'
}

const renderTimePicker = ({input, hintText, floatingLabelText, name, defaultTime, onChange, meta: {touched, error}}) => (
  <MUITimePicker
    hintText={hintText}
    floatingLabelText={floatingLabelText}
    errorText={touched && error}
    name={name}
    autoOk={true}
    format="24hr"
    defaultTime={defaultTime}
    fullWidth={true}
    onChange={(e, val) => {
      input.onChange(moment(val).format('HH:mm:ss'))
      onChange(e, val)
    }}
    style={style}
  />
)

renderTimePicker.propTypes = {
  input: PropTypes.object,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  name: PropTypes.string.isRequired,
  meta: PropTypes.object,
  defaultTime: PropTypes.object,
  onCHange: PropTypes.func
}

export const FormTimePickerIntl = (props) => (
  <Field name={props.name}
         hintText={props.hintText ? props.intl.formatMessage({id: props.hintText}) : ''}
         floatingLabelText={props.floatingLabelText ? props.intl.formatMessage({id: props.floatingLabelText}) : ''}
         onChange={props.onChange}
         defaultTime={props.defaultTime}
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
  defaultTime: PropTypes.object
}