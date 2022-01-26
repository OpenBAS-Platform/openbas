import React from 'react';
import { Field } from 'react-final-form';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { AddOutlined } from '@mui/icons-material';
import MuiAutocomplete from '@mui/material/Autocomplete';

const renderAutocomplete = ({
  label,
  placeholder,
  input: { onChange, ...inputProps },
  meta: { touched, invalid, error },
  fullWidth,
  style,
  openCreate,
  noMargin,
  ...others
}) => {
  let top = 30;
  if (placeholder) {
    top = -5;
  } else if (noMargin) {
    top = 10;
  }
  return (
    <div style={{ position: 'relative' }}>
      <MuiAutocomplete
        label={label}
        selectOnFocus={true}
        autoHighlight={true}
        clearOnBlur={false}
        clearOnEscape={false}
        onInputChange={(event, value) => {
          if (others.freeSolo) {
            onChange(value);
          }
        }}
        onChange={(event, value) => {
          onChange(value);
        }}
        {...inputProps}
        {...others}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            variant={others.variant || 'standard'}
            label={label}
            placeholder={placeholder}
            fullWidth={fullWidth}
            style={style}
            error={touched && invalid}
            helperText={touched && error}
          />
        )}
      />
      {typeof openCreate === 'function' && (
        <IconButton
          onClick={() => openCreate()}
          edge="end"
          style={{ position: 'absolute', top, right: 35 }}
        >
          <AddOutlined />
        </IconButton>
      )}
    </div>
  );
};

// eslint-disable-next-line import/prefer-default-export
export const Autocomplete = (props) => (
  <Field name={props.name} component={renderAutocomplete} {...props} />
);
