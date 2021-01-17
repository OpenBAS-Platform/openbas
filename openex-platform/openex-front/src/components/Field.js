import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import MUITextField from '@material-ui/core/TextField';
import { Field } from 'react-final-form';
import { injectIntl } from 'react-intl';
import CKEditor4 from 'ckeditor4-react';

const styles = {
  global: {
    marginBottom: 20,
  },
  input: {
    borderRadius: 5,
  },
  richText: {
    header: {
      fontSize: 12,
      opacity: 0.6,
      marginBottom: 8,
      marginTop: 8,
    },
    content: {
      color: 'black',
    },
  },
  minHeight: {
    minHeight: '300px',
  },
};

const renderTextField = ({
  input,
  label,
  fullWidth,
  multiLine,
  rows,
  type,
  placeholder,
  onFocus,
  onClick,
  meta: { touched, error },
}) => (
  <MUITextField
    placeholder={placeholder}
    label={label}
    floatingLabelFixed={false}
    errorText={touched && error}
    style={styles.global}
    inputStyle={styles.input}
    fullWidth={fullWidth}
    multiLine={multiLine}
    rows={rows}
    type={type}
    onFocus={onFocus}
    onClick={onClick}
    {...input}
  />
);

renderTextField.propTypes = {
  input: PropTypes.object,
  fullWidth: PropTypes.bool,
  multiLine: PropTypes.bool,
  rows: PropTypes.number,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  meta: PropTypes.object,
  onFocus: PropTypes.func,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
};

export const TextFieldIntl = (props) => (
  <Field
    name={props.name}
    label={
      props.label ? props.intl.formatMessage({ id: props.label }) : undefined
    }
    placeholder={
      props.placeholder
        ? props.intl.formatMessage({ id: props.placeholder })
        : undefined
    }
    fullWidth={props.fullWidth}
    multiLine={props.multiLine}
    rows={props.rows}
    type={props.type}
    onFocus={props.onFocus}
    onBlur={props.onBlur}
    onClick={props.onClick}
    onChange={props.onChange}
    component={renderTextField}
  />
);

export const TextField = injectIntl(TextFieldIntl);

TextFieldIntl.propTypes = {
  placeholder: PropTypes.string,
  label: PropTypes.string,
  intl: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
  fullWidth: PropTypes.bool,
  multiLine: PropTypes.bool,
  rows: PropTypes.number,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
};
