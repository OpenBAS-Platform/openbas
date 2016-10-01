import React, {PropTypes} from 'react'
import TextField from 'material-ui/TextField'
import {Field} from 'redux-form'
import {injectIntl} from 'react-intl'

const styles = {
  global: {
    marginBottom: 10,
  },
  input: {
    borderRadius: 5
  }
}

const renderTextField = ({input, label, fullWidth, type, hint, meta: {touched, error}}) => (
  <TextField hintText={hint}
             floatingLabelText={label}
             floatingLabelFixed={true}
             errorText={touched && error}
             style={styles.global}
             inputStyle={styles.input}
             fullWidth={fullWidth}
             type={type}
             {...input}
  />)

renderTextField.propTypes = {
  input: PropTypes.object,
  fullWidth: PropTypes.number,
  type: PropTypes.string,
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

export const SimpleFormFieldIntl = (props) => (
  <Field name={props.name}
         hint={props.intl.formatMessage({id: props.hint})}
         type={props.type}
         fullWidth={props.fullWidth}
         component={renderTextField}/>
)

export const SimpleFormField = injectIntl(SimpleFormFieldIntl)

SimpleFormFieldIntl.propTypes = {
  hint: PropTypes.string,
  intl: PropTypes.object,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  fullWidth: PropTypes.bool
}