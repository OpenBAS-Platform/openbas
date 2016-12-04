import React, {PropTypes} from 'react';
import MUIToggle from 'material-ui/Toggle';
import {Field} from 'redux-form'
import {injectIntl} from 'react-intl'

const renderToggleField = ({input, label, defaultToggled, meta: {touched, error}}) => (
  <MUIToggle
    label={label}
    defaultToggled={defaultToggled}
    {...input}
    onToggle={(value) => {
      input.onChange(value)
    }}
  />
)

renderToggleField.propTypes = {
  input: PropTypes.object,
  label: PropTypes.node,
  defaultToggled: PropTypes.bool,
  onToggle: PropTypes.func,
  meta: PropTypes.object
}

export const ToggleFieldIntl = (props) => (
  <Field label={props.label ? props.intl.formatMessage({id: props.label}) : undefined}
         component={renderToggleField} {...props}/>
)

export const ToggleField = injectIntl(ToggleFieldIntl)

ToggleFieldIntl.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  intl: PropTypes.object,
  defaultToggled: PropTypes.bool
}