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
  ...others
}) => {
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
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {
                    typeof openCreate === 'function' && (
                      <IconButton
                        onClick={() => openCreate()}
                      >
                        <AddOutlined />
                      </IconButton>
                    )
                  }
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </div>
  );
};

/**
 * @deprecated The component use old form libnary react-final-form
 */
const Autocomplete = (props) => {
  return (<Field name={props.name} component={renderAutocomplete} {...props} />
  );
};

export default Autocomplete;
