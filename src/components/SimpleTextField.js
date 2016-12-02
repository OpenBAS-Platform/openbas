import React, {PropTypes} from 'react'
import MUITextField from 'material-ui/TextField';
import {injectIntl} from 'react-intl'
import * as Constants from '../constants/ComponentTypes'

const styles = {
  [ Constants.FIELD_TYPE_INTITLE ]: {
    padding: '0 20px 10px 20px'
  },
  [ Constants.FIELD_TYPE_INLINE ]: {
    padding: '0 0 6px 0'
  }
}

const SimpleTextFieldIntl = (props) => (
  <MUITextField
    fullWidth={props.fullWidth}
    hintText={props.hintText ? props.intl.formatMessage({id: props.hintText}) : ''}
    floatingLabelText={props.floatingLabelText ? props.intl.formatMessage({id: props.floatingLabelText}) : ''}
    name={props.name}
    type={props.type}
    disabled={props.disabled}
    onChange={props.onChange}
    style={{paddingBottom: 10}}
    inputStyle={styles[props.styletype]}
    hintStyle={styles[props.styletype]}
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
  styletype: PropTypes.string
}