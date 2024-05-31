import React from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { Button } from '@mui/material';
import MarkDownField from '../../../../components/fields/MarkDownField';
import { useFormatter } from '../../../../components/i18n';

interface PolicyInput {
  platform_login_message: string;
  platform_consent_message: string;
  platform_consent_confirm_text: string;
}

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
  const { t } = useFormatter();

  const methods = useForm<PolicyInput>({
    mode: 'onTouched',
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = methods;

  return (
    <FormProvider {...methods}>
      <form id="policyForm" onSubmit={handleSubmit(onSubmit)}>
        <MarkDownField
          name="platform_login_message"
          label={t('Platform login message')}
          style={{ marginTop: 0 }}
          askAi={false}
          inInject={false}
          inArticle={false}
        />
        <MarkDownField
          name="platform_consent_message"
          label={t('Platform consent message')}
          style={{ marginTop: 20 }}
          askAi={false}
          inInject={false}
          inArticle={false}
        />
        <MarkDownField
          name="platform_consent_confirm_text"
          label={t('Platform consent confirm text')}
          style={{ marginTop: 20 }}
          askAi={false}
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
    </FormProvider>
  );
};

export default PolicyForm;
