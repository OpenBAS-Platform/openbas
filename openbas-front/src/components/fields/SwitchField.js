import { FormControl, FormControlLabel, FormGroup, FormHelperText, Switch as MuiSwitch } from '@mui/material';
import { Field } from 'react-final-form';

const renderSwitch = ({
  label,
  input,
  meta: { touched, invalid, error, submitError },
  style,
  ...others
}) => (
  <FormControl error={touched && invalid}>
    <FormGroup row={true} style={{ ...style, marginLeft: 5 }}>
      <FormControlLabel
        control={(
          <MuiSwitch
            checked={!!input.value}
            onChange={(event) => {
              input.onChange(event.target.checked);
            }}
            {...others}
          />
        )}
        label={label}
      />
    </FormGroup>
    <FormHelperText>{touched && (error || submitError)}</FormHelperText>
  </FormControl>
);

const SwitchField = props => (
  <Field name={props.name} component={renderSwitch} {...props} />
);

export default SwitchField;
