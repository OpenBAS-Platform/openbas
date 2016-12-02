import React, {PropTypes} from 'react'
import MUISelectField from 'material-ui/SelectField'
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

const renderSelectField = ({input, label, fullWidth, multiLine, rows, type, hint, children, meta: {touched, error}}) => (
  <MUISelectField hintText={hint}
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
                  onChange={(event, index, value) => input.onChange(value)}
                  children={children}
  />)

renderSelectField.propTypes = {
  input: PropTypes.object,
  fullWidth: PropTypes.bool,
  multiLine: PropTypes.bool,
  rows: PropTypes.number,
  type: PropTypes.string,
  hint: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  meta: PropTypes.object,
  children: PropTypes.node
}

export const SelectFieldIntl = (props) => (
  <Field name={props.name}
         label={props.label ? props.intl.formatMessage({id: props.label}) : undefined}
         hint={props.hint ? props.intl.formatMessage({id: props.hint}) : undefined}
         fullWidth={props.fullWidth}
         multiLine={props.multiLine}
         rows={props.rows}
         type={props.type}
         children={props.children}
         component={renderSelectField}/>
)

export const SelectField = injectIntl(SelectFieldIntl)

SelectFieldIntl.propTypes = {
  hint: PropTypes.string,
  label: PropTypes.string,
  intl: PropTypes.object,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  fullWidth: PropTypes.bool,
  multiLine: PropTypes.bool,
  rows: PropTypes.number,
  onChange: PropTypes.func,
  children: PropTypes.node
}
