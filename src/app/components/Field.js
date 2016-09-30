import React, {PropTypes} from 'react';
import TextField from 'material-ui/TextField';
import {Field} from 'redux-form'

const renderTextField = ({input, label, hint, meta: {touched, error}}) => (
  <TextField hintText={hint}
             floatingLabelText={label}
             floatingLabelFixed={true}
             errorText={touched && error}
             {...input}
  />
)

renderTextField.propTypes = {
  input: PropTypes.object,
  hint: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  meta: PropTypes.object
}

export const FormField = (props) => (
  <Field name={props.name} label={props.label} hint={props.hint} type={props.type} component={renderTextField}/>
)

FormField.propTypes = {
  hint: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string
}