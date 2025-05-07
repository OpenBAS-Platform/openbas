import { FormControlLabel, Switch } from '@mui/material';
import type React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  label: React.ReactNode;
  name: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  required?: boolean;
}

const SwitchFieldController = ({ name, label, disabled, size = 'medium', required }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Switch {...field} size={size} checked={!!field?.value} disabled={disabled} required={required} />}
          label={label}
        />
      )}
    />
  );
};

export default SwitchFieldController;
