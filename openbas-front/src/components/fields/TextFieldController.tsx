import { TextField, type TextFieldVariants } from '@mui/material';
import { type CSSProperties } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

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

const useStyles = makeStyles()(theme => ({ root: { '& .MuiOutlinedInput-root': { background: theme.palette.background.code } } }));

const TextFieldController = ({ name, label, multiline, rows, required, style = {}, size, variant, placeholder = '' }: Props) => {
  const { control } = useFormContext();
  const { classes } = useStyles();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label={label || ''}
          className={classes.root}
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
