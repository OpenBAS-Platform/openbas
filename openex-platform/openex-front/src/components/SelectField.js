import React from 'react';
import PropTypes from 'prop-types';
import MUISelect from '@material-ui/core/Select';
import { Field } from 'redux-form';

const styles = {
  global: {
    marginBottom: '10px',
  },
  input: {
    borderRadius: '5px',
  },
};

const renderSelectField = ({
  input,
  onSelectChange,
  label,
  fullWidth,
  multiLine,
  rows,
  type,
  hint,
  children,
  meta: { touched, error },
}) => (
  <MUISelect
    hintText={hint}
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
    onChange={(event, index, value) => {
      onSelectChange && onSelectChange(event, index, value);
      input.onChange(value);
    }}
    children={children}
  />
);

renderSelectField.propTypes = {
  input: PropTypes.object,
  fullWidth: PropTypes.bool,
  multiLine: PropTypes.bool,
  rows: PropTypes.number,
  type: PropTypes.string,
  hint: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  name: PropTypes.string,
  meta: PropTypes.object,
  onSelectChange: PropTypes.func,
  children: PropTypes.node,
};

export const SelectField = (props) => (
  <Field component={renderSelectField} {...props} />
);
