import React from 'react';
import { Field } from 'react-final-form';
import { TextField, IconButton, Autocomplete as MuiAutocomplete } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';

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
        isOptionEqualToValue={(option, value) => value === undefined || value === '' || option.id === value.id}
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

/**
 * @deprecated The component use old form libnary react-final-form
 */
const Autocomplete = (props) => (
  <Field name={props.name} component={renderAutocomplete} {...props} />
);

export default Autocomplete;
