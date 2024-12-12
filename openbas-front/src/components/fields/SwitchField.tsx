import { FormControlLabel, Switch } from '@mui/material';
import { CSSProperties } from 'react';
import { Control, Controller } from 'react-hook-form';

interface Props {
  label: string;
  control: Control;
  name: string;
  style?: CSSProperties;
}

const SwitchField = ({ control, label, name, style = {}, ...extraProps }: Props) => {
  return (
    <div style={style}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FormControlLabel
            control={<Switch {...field} checked={!!field?.value} {...extraProps} />}
            label={label}
          />
        )}
      />
    </div>
  );
};

export default SwitchField;
