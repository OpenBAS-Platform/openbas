import React, {PropTypes} from 'react'
import MUIAutoComplete from 'material-ui/AutoComplete'
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

const renderAutoCompleteField = ({intl, input, label, fullWidth, hint, onFocus, onClick, dataSource, dataSourceConfig, openOnFocus, filter, meta: {touched, error}}) => (
  <MUIAutoComplete hintText={hint}
                   floatingLabelText={label}
                   floatingLabelFixed={false}
                   errorText={touched && (error ? intl.formatMessage({id: error}) : undefined)}
                   style={styles.global}
                   inputStyle={styles.input}
                   fullWidth={fullWidth}
                   dataSource={dataSource}
                   dataSourceConfig={dataSourceConfig}
                   openOnFocus={openOnFocus}
                   filter={filter}
                   onFocus={onFocus}
                   onClick={onClick}
                   searchText={input.value}
                   onNewRequest={(value) => input.onChange(value)}
                   {...input}
  />)

renderAutoCompleteField.propTypes = {
  input: PropTypes.object,
  fullWidth: PropTypes.bool,
  hint: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  meta: PropTypes.object,
  onFocus: PropTypes.func,
  onClick: PropTypes.func,
  dataSource: PropTypes.array,
  dataSourceConfig: PropTypes.object,
  openOnFocus: PropTypes.bool,
  filter: PropTypes.func
}

export const AutoCompleteFieldIntl = (props) => (
  <Field name={props.name}
         label={props.label ? props.intl.formatMessage({id: props.label}) : undefined}
         hint={props.hint ? props.intl.formatMessage({id: props.hint}) : undefined}
         fullWidth={props.fullWidth}
         onFocus={props.onFocus}
         onClick={props.onClick}
         dataSource={props.dataSource}
         dataSourceConfig={props.dataSourceConfig}
         openOnFocus={props.openOnFocus}
         filter={props.filter}
         component={injectIntl(renderAutoCompleteField)}/>
)

export const AutoCompleteField = injectIntl(AutoCompleteFieldIntl)

AutoCompleteFieldIntl.propTypes = {
  hint: PropTypes.string,
  label: PropTypes.string,
  intl: PropTypes.object,
  name: PropTypes.string.isRequired,
  fullWidth: PropTypes.bool,
  onFocus: PropTypes.func,
  onClick: PropTypes.func,
  dataSource: PropTypes.array,
  dataSourceConfig: PropTypes.object,
  openOnFocus: PropTypes.bool,
  filter: PropTypes.func
}
