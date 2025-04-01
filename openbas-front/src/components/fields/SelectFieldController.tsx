import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { type CSSProperties } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Item {
  value: string;
  label: string;
}
interface Props {
  name: string;
  label: string;
  items: Item[];
  style?: CSSProperties;
  required?: boolean;
  disabled?: boolean;
}

const SelectFieldController = ({ name, label, items, style, required, disabled }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          <InputLabel id={`select-label-${name}`}>{`${label}${required ? ' *' : ''}`}</InputLabel>
          <Select
            {...field}
            labelId={`select-label-${name}`}
            id={`select-label-${name}`}
            style={style}
            disabled={disabled}
          >
            {items.map(item => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export default SelectFieldController;
