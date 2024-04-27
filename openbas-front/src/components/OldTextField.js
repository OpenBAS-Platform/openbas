import React from 'react';
import { Field } from 'react-final-form';
import { TextField as MuiTextField } from '@mui/material';
import { useFormatter } from './i18n';
import TextFieldAskAI from '../admin/components/common/form/TextFieldAskAI';

const TextFieldBase = ({
  label,
  input,
  meta: { touched, invalid, error, submitError },
  askAi,
  ...others
}) => {
  const { t } = useFormatter();
  return (
    <MuiTextField
      label={label}
      error={touched && invalid}
      helperText={
        touched && ((error && t(error)) || (submitError && t(submitError)))
      }
      {...input}
      {...others}
      InputProps={{
        endAdornment: askAi && (
        <TextFieldAskAI
          currentValue={input.value}
          setFieldValue={(val) => {
            others.onChange(input.name, val);
          }}
          format="text"
          disabled={others.disabled}
        />
        ),
      }}
    />
  );
};

/**
 * @deprecated The component use old form libnary react-final-form
 */
const OldTextField = (props) => (
  <Field name={props.name} component={TextFieldBase} {...props} />
);

export default OldTextField;
