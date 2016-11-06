import React, {PropTypes} from 'react'
import MUITextField from 'material-ui/TextField';
import {injectIntl} from 'react-intl'

const SimpleTextFieldIntl = (props) => (
  <MUITextField
    fullWidth={props.fullWidth}
    hintText={props.hintText ? props.intl.formatMessage({id: props.hintText}) : ''}
    floatingLabelText={props.floatingLabelText ? props.intl.formatMessage({id: props.floatingLabelText}) : ''}
    name={props.name}
    type={props.type}
    disabled={props.disabled}
    onChange={props.onChange}
  />
)

export const SimpleTextField = injectIntl(SimpleTextFieldIntl)

SimpleTextFieldIntl.propTypes = {
  fullWidth: PropTypes.bool,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  intl: PropTypes.object,
}