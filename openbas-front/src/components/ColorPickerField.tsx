import * as React from 'react';
import { TextField as MuiTextField, IconButton, Popover, InputAdornment, TextFieldProps } from '@mui/material';
// @ts-expect-error react-color does not have types
import { SketchPicker } from 'react-color';
import { ColorLensOutlined } from '@mui/icons-material';
import { Control, useController } from 'react-hook-form';

type Props = Omit<TextFieldProps, 'name'> & {
  control: Control,
  name: string
};

interface Color {
  hex: string
}

const ColorPickerField: React.FC<Props> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const { field } = useController({ name: props.name, control: props.control });

  return (
    <>
      <MuiTextField
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="open"
                onClick={(event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)}
                disabled={props.disabled}
              >
                <ColorLensOutlined />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={field.onChange}
        value={field.value || ''}
        {...props}
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
          color={field.value || ''}
          onChange={(color: Color) => field.onChange(color.hex)}
        />
      </Popover>
    </>
  );
};

export default ColorPickerField;
