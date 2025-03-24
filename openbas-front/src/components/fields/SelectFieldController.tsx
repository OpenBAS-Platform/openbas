import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  isLabelAligned?: boolean;
  style?: CSSProperties;
  required?: boolean;
  disabled?: boolean;
}

const SelectFieldController = ({ name, label, items, isLabelAligned, style, required, disabled }: Props) => {
  const { control } = useFormContext();
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex',
      gap: theme.spacing(2),
      alignItems: 'center',
    }}
    >
      {isLabelAligned && (
        <Typography sx={{ margin: 0 }} variant="h3">
          {`${label}${required ? ' *' : ' :'}`}
        </Typography>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl size="medium" error={!!error}>
            {!isLabelAligned && <InputLabel>{`${label}${required ? ' *' : ''}`}</InputLabel>}
            <Select
              {...field}
              label={label}
              sx={{ minWidth: 140 }}
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
    </div>
  );
};

export default SelectFieldController;
