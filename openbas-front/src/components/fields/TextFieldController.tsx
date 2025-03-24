import { TextField } from '@mui/material';
import { type CSSProperties } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  name: string;
  label: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  style?: CSSProperties;
}

const TextFieldController = ({ name, label, multiline, rows, required, style = {} }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label={label}
          fullWidth
          error={!!error}
          helperText={error ? error.message : null}
          multiline={multiline}
          rows={rows}
          style={style}
          required={required}
        />
      )}
    />
  );
};

export default TextFieldController;
