import React from 'react';
import { Field } from 'react-final-form';
import MuiTextField from '@mui/material/TextField';
import { SketchPicker } from 'react-color';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import InputAdornment from '@mui/material/InputAdornment';
import { ColorLensOutlined } from '@mui/icons-material';

const ColorPickerFieldBase = ({
  label,
  input: { onChange, ...inputProps },
  meta: { touched, invalid, error, submitError },
  ...others
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleChange = (color) => {
    onChange(color && color.hex ? color.hex : '');
  };
  return (
    <>
      <MuiTextField
        label={label}
        error={touched && invalid}
        helperText={touched && (error || submitError)}
        {...others}
        InputProps={{
          ...inputProps,
          onChange,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="open"
                onClick={(event) => setAnchorEl(event.currentTarget)}
                disabled={others.disabled}
              >
                <ColorLensOutlined />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
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
    </>
  );
};

const ColorPickerField = (props) => (
  <Field name={props.name} component={ColorPickerFieldBase} {...props} />
);

export default ColorPickerField;
