import React, {PropTypes} from 'react'
import TextField from 'material-ui/TextField'
import {Field} from 'redux-form'
import {injectIntl} from 'react-intl'

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

export const FormFieldIntl = (props) => (
  <Field name={props.name}
         label={props.intl.formatMessage({id: props.label})}
         hint={props.intl.formatMessage({id: props.hint})}
         type={props.type}
         component={renderTextField}/>
)

export const FormField = injectIntl(FormFieldIntl)

FormFieldIntl.propTypes = {
  hint: PropTypes.string,
  label: PropTypes.string,
  intl: PropTypes.object,
  name: PropTypes.string.isRequired,
  type: PropTypes.string
}