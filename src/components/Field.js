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

const renderTextField = ({input, label, fullWidth, multiLine, rows, type, hint, meta: {touched, error}}) => (
  <TextField hintText={hint}
             floatingLabelText={label}
             floatingLabelFixed={false}
             errorText={touched && error}
             style={styles.global}
             inputStyle={styles.input}
             fullWidth={fullWidth}
             multiLine={multiLine}
             rows={rows}
             type={type}
             {...input}
  />)

renderTextField.propTypes = {
  input: PropTypes.object,
  fullWidth: PropTypes.bool,
  multiLine: PropTypes.bool,
  rows: PropTypes.number,
  type: PropTypes.string,
  hint: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  meta: PropTypes.object,
}

export const FormFieldIntl = (props) => (
  <Field name={props.name}
         label={props.label ? props.intl.formatMessage({id: props.label}) : ''}
         hint={props.hint ? props.intl.formatMessage({id: props.hint}) : ''}
         fullWidth={props.fullWidth}
         multiLine={props.multiLine}
         rows={props.rows}
         type={props.type}
         component={renderTextField}/>
)

export const FormField = injectIntl(FormFieldIntl)

FormFieldIntl.propTypes = {
  hint: PropTypes.string,
  label: PropTypes.string,
  intl: PropTypes.object,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  fullWidth: PropTypes.bool,
  multiLine: PropTypes.bool,
  rows: PropTypes.number,
}