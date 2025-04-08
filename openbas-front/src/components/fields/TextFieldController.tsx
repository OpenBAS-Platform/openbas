import { TextField, type TextFieldVariants } from '@mui/material';
import { type CSSProperties } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  name: string;
  label?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  style?: CSSProperties;
  variant?: TextFieldVariants;
  placeholder?: string;
  size?: 'medium' | 'small';
}

const TextFieldController = ({ name, label, multiline, rows, required, style = {}, size, variant, placeholder = '' }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label={label || ''}
          fullWidth
          error={!!error}
          helperText={error ? error.message : null}
          multiline={multiline}
          rows={rows}
          aria-label={label}
          required={required}
          placeholder={placeholder}
          style={style}
          variant={variant || 'standard'}
          size={size || 'medium'}
        />
      )}
    />
  );
};

export default TextFieldController;
