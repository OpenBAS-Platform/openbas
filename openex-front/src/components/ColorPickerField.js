import React from 'react';
import { Field } from 'react-final-form';
import MuiTextField from '@mui/material/TextField';
import { SketchPicker } from 'react-color';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import InputAdornment from '@mui/material/InputAdornment';
import { ColorLensOutlined } from '@mui/icons-material';

const renderColorPickerField = ({
  label,
  input: { onChange, ...inputProps },
  meta: {
    touched, invalid, error, submitError,
  },
  ...others
}) => {
  const anchorEl = React.createRef();
  const [open, setOpen] = React.useState(false);
  const handleChange = (color) => {
    onChange(color && color.hex ? color.hex : '');
  };
  return (
    <div>
      <MuiTextField
        label={label}
        error={touched && invalid}
        helperText={touched && (error || submitError)}
        {...inputProps}
        {...others}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label="open" onClick={() => setOpen(true)}>
                <ColorLensOutlined />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <SketchPicker
          color={inputProps.value || ''}
          onChangeComplete={(color) => handleChange(color)}
        />
      </Popover>
    </div>
  );
};

// eslint-disable-next-line import/prefer-default-export
export const ColorPickerField = (props) => (
  <Field name={props.name} component={renderColorPickerField} {...props} />
);
