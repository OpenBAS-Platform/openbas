import React from 'react';
import { FormControl, FormHelperText, InputLabel, Select as MUISelect } from '@mui/material';
import { Controller } from 'react-hook-form';

const SelectField = (props) => {
  const {
    name,
    label,
    children,
    fullWidth,
    style,
    helperText,
    control,
    defaultValue,
    ...others
  } = props;
  return (
    <FormControl fullWidth={fullWidth} style={style}>
      {others.displayEmpty ? (
        <InputLabel
          shrink={true}
          htmlFor={name}
          variant={others.variant || 'standard'}
        >
          {label}
        </InputLabel>
      ) : (
        <InputLabel htmlFor={name} variant={others.variant || 'standard'}>
          {label}
        </InputLabel>
      )}
      <Controller
        name={name}
        id={name}
        defaultValue={defaultValue}
        control={control}
        render={({ field }) => (
          <MUISelect {...field}>
            {children}
          </MUISelect>
        )}
      />
      {helperText && (
        <FormHelperText variant={others.variant}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default SelectField;
