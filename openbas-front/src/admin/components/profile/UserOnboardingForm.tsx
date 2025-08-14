import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, type SyntheticEvent, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import SelectFieldController from '../../../components/fields/SelectFieldController';
import { useFormatter } from '../../../components/i18n';
import { type UpdateOnboardingInput, type User } from '../../../utils/api-types';
import { zodImplement } from '../../../utils/Zod';
import { onboardingItems } from '../utils/OptionItems';

interface UserOnboardingFormProps {
  onSubmit: (data: UpdateOnboardingInput) => void;
  initialValues: User;
}

const UserOnboardingForm: FunctionComponent<UserOnboardingFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const { t } = useFormatter();
  const theme = useTheme();

  const methods = useForm<UpdateOnboardingInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<UpdateOnboardingInput>().with({
        user_onboarding_contextual_help_enable: z.enum(['DEFAULT', 'ENABLED', 'DISABLED']),
        user_onboarding_widget_enable: z.enum(['DEFAULT', 'ENABLED', 'DISABLED']),
      }),
    ),
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = methods;
  const handleSubmitWithoutPropagation = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };
  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const handleReset = async () => {
    const data: UpdateOnboardingInput = {
      user_onboarding_widget_enable: onboardingItems(t)[0].value,
      user_onboarding_contextual_help_enable: onboardingItems(t)[0].value,
    };
    reset(data);
    onSubmit(data);
  };
  return (
    <FormProvider {...methods}>
      <form
        id="userForm"
        onSubmit={handleSubmitWithoutPropagation}
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          gap: theme.spacing(2.5),
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body2">{t('onboarding_process')}</Typography>
          <Button type="button" variant="text" size="small" onClick={handleReset}>{t('Reset')}</Button>
        </Box>
        <SelectFieldController name="user_onboarding_widget_enable" label={t('onboarding_display_widget')} items={onboardingItems(t)} />
        <SelectFieldController name="user_onboarding_contextual_help_enable" label={t('onboarding_display_contextual_buttons')} items={onboardingItems(t)} />
        <div>
          <Button
            variant="contained"
            color="primary"
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

export default UserOnboardingForm;
