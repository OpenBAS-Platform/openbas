import { TextField, Typography } from '@mui/material';
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
  isCommand?: boolean;
  placeholder?: string;
}

const useStyles = makeStyles()(theme => ({
  root: {
    '& .MuiOutlinedInput-root': { background: theme.palette.background.code },
    '& .MuiOutlinedInput-input': {
      paddingBottom: theme.spacing(1),
      paddingTop: theme.spacing(1),
    },
  },
}));

const TextFieldController = ({ name, label, multiline, rows, required, style = {}, isCommand = false, placeholder = '' }: Props) => {
  const { control } = useFormContext();
  const { classes } = useStyles();

  return (
    <div style={{
      width: '100%',
      ...style,
    }}
    >
      { ((isCommand && label)) && (
        <Typography variant="h3">
          {`${label}${required ? ' *' : ' :'}`}
        </Typography>
      ) }
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label={!isCommand && label ? label : ''}
            className={classes.root}
            fullWidth
            error={!!error}
            helperText={error ? error.message : null}
            multiline={multiline}
            rows={rows}
            aria-label={label}
            required={!isCommand && required}
            variant={isCommand ? 'outlined' : 'standard'}
            slotProps={{ ...isCommand && ({ inputLabel: { shrink: false } }) }}
            placeholder={placeholder}
          />
        )}
      />
    </div>
  );
};

export default TextFieldController;
