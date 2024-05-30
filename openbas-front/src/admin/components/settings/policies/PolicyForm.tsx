import React from 'react';
import { Button } from '@mui/material';
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
  const { t } = useFormatter(); // Assuming useFormatter is a custom hook

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<PolicyInput>({
    mode: 'onTouched',
    defaultValues: initialValues,
  });

  return (
    <form id="policyForm" onSubmit={handleSubmit(onSubmit)}>
      <MarkDownField
        label={t('Platform login message')}
        style={{ marginTop: 20 }}
        askAi={true}
        inInject={false}
        inArticle={false}
      />
      <MarkDownField
        label={t('Platform consent message')}
        style={{ marginTop: 20 }}
        askAi={true}
        inInject={false}
        inArticle={false}
      />
      <MarkDownField
        label={t('Platform consent confirm text')}
        style={{ marginTop: 20 }}
        askAi={true}
        inInject={false}
        inArticle={false}
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
