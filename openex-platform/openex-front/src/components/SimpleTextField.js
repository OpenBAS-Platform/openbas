import React from 'react';
import * as PropTypes from 'prop-types';
import MUITextField from '@material-ui/core/TextField';
import { injectIntl } from 'react-intl';
import * as Constants from '../constants/ComponentTypes';

const styles = {
  [Constants.FIELD_TYPE_INTITLE]: {
    padding: '0 20px 10px 20px',
  },
  [Constants.FIELD_TYPE_INLINE]: {
    padding: '0 0 6px 0',
  },
};

const SimpleTextFieldIntl = (props) => (
  <MUITextField
    fullWidth={props.fullWidth}
    hintText={
      props.hintText ? props.intl.formatMessage({ id: props.hintText }) : ''
    }
    floatingLabelText={
      props.floatingLabelText
        ? props.intl.formatMessage({ id: props.floatingLabelText })
        : ''
    }
    name={props.name}
    type={props.type}
    disabled={props.disabled}
    onChange={props.onChange}
    style={{ paddingBottom: 10 }}
    inputStyle={styles[props.styletype]}
    hintStyle={styles[props.styletype]}
  />
);

export const SimpleTextField = injectIntl(SimpleTextFieldIntl);

SimpleTextFieldIntl.propTypes = {
  fullWidth: PropTypes.bool,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  intl: PropTypes.object,
  styletype: PropTypes.string,
};

const SearchFieldIntl = (props) => (
  <MUITextField
    fullWidth={props.fullWidth}
    hintText={
      props.hintText ? props.intl.formatMessage({ id: props.hintText }) : ''
    }
    floatingLabelText={
      props.floatingLabelText
        ? props.intl.formatMessage({ id: props.floatingLabelText })
        : ''
    }
    name={props.name}
    type={props.type}
    disabled={props.disabled}
    onChange={props.onChange}
    underlineShow={false}
    hintStyle={{ padding: '0px 15px 0px 15px', margin: '0px 0px -2px -30px' }}
    inputStyle={{
      borderRadius: '15px',
      padding: '0px 15px 0px 15px',
      margin: '10px 0px 0px -30px',
      height: '30px',
      backgroundColor: 'rgba(0, 0, 0, .1)',
    }}
    style={{ width: '200px', margin: '-15px 0 0 0' }}
  />
);

export const SearchField = injectIntl(SearchFieldIntl);

SearchFieldIntl.propTypes = {
  fullWidth: PropTypes.bool,
  hintText: PropTypes.string,
  floatingLabelText: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  intl: PropTypes.object,
  styletype: PropTypes.string,
};
