import React, {PropTypes} from 'react'
import MUITextField from 'material-ui/TextField'
import {Field} from 'redux-form'
import {injectIntl} from 'react-intl'

const styles = {
  global: {
    marginBottom: '10px',
  },
  input: {
    borderRadius: '5px'
  }
}

const renderTextField = ({intl, input, label, fullWidth, multiLine, rows, type, hint, onFocus, onClick, meta: {touched, error}}) => (
  <MUITextField hintText={hint}
                floatingLabelText={label}
                floatingLabelFixed={false}
                errorText={touched && (error ? intl.formatMessage({id: error}) : undefined)}
                style={styles.global}
                inputStyle={styles.input}
                fullWidth={fullWidth}
                multiLine={multiLine}
                rows={rows}
                type={type}
                onFocus={onFocus}
                onClick={onClick}
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
  onFocus: PropTypes.func,
  onClick: PropTypes.func,
  onChange: PropTypes.func
}

export const FormFieldIntl = (props) => (
  <Field name={props.name}
         label={props.label ? props.intl.formatMessage({id: props.label}) : undefined}
         hint={props.hint ? props.intl.formatMessage({id: props.hint}) : undefined}
         fullWidth={props.fullWidth}
         multiLine={props.multiLine}
         rows={props.rows}
         type={props.type}
         onFocus={props.onFocus}
         onClick={props.onClick}
         onChange={props.onChange}
         component={injectIntl(renderTextField)}/>
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
  onFocus: PropTypes.func,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
}
