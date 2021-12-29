import React from 'react';
import { Field } from 'react-final-form';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { AddOutlined } from '@mui/icons-material';
import MuiAutocomplete from '@mui/material/Autocomplete';

const renderAutocomplete = ({
  label,
  input: { onChange, ...inputProps },
  meta: { touched, invalid, error },
  fullWidth,
  style,
  openCreate,
  ...others
}) => (
  <div style={{ position: 'relative' }}>
    <MuiAutocomplete
      label={label}
      selectOnFocus={true}
      autoHighlight={true}
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
      renderInput={(params) => (
        <TextField
          {...params}
          variant={others.variant || 'standard'}
          label={label}
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
        style={{ position: 'absolute', top: 30, right: 35 }}
      >
        <AddOutlined />
      </IconButton>
    )}
  </div>
);

// eslint-disable-next-line import/prefer-default-export
export const Autocomplete = (props) => (
  <Field name={props.name} component={renderAutocomplete} {...props} />
);
