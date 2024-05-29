import React from 'react';
import { Button, TextField } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useFormatter } from '../../../../components/i18n';
import MarkDownField from '../../../../components/fields/MarkDownField';
import type { PolicyInput } from '../../../../utils/api-types';

interface Props {
  onSubmit: SubmitHandler<PolicyInput>;
  initialValues?: PolicyInput;
}

const PolicyForm: React.FC<Props> = ({
  onSubmit,
  initialValues = {
    platform_login_message: '',
    platform_consent_message: '',
    platform_consent_confirm_text: '',
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<PolicyInput>({
    mode: 'onTouched',
    defaultValues: initialValues,
  });

  return (
    <form id="policyForm" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        component={MarkDownField}
        name="platform_login_message"
        label={t('Platform login message')}
        fullWidth
        multiline={true}
        rows="3"
        variant="standard"
      />
      <TextField
        component={MarkDownField}
        name="platform_consent_message"
        label={t('Platform consent message')}
        fullWidth
        style={{ marginTop: 20 }}
        variant="standard"
      />
      <TextField
        component={MarkDownField}
        name="platform_consent_confirm_text"
        label={t('Platform consent confirm text')}
        fullWidth
        style={{ marginTop: 20 }}
        variant="standard"
      />
      <div style={{ marginTop: 20 }}>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {t('Update')}
        </Button>
      </div>
    </form>
  );
};

export default PolicyForm;
