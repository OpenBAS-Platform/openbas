import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, TextField as MuiTextField } from '@mui/material';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormatter } from '../../../components/i18n';
import type { ThemeInput } from '../../../utils/api-types';
import { zodImplement } from '../../../utils/Zod';
import ColorPickerField from '../../../components/ColorPickerField';

interface Props {
  onSubmit: SubmitHandler<ThemeInput>;
  initialValues?: ThemeInput;
}

const ThemeForm: React.FC<Props> = ({
  onSubmit,
  initialValues,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ThemeInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<ThemeInput>().with({
        accent_color: z.string().optional().nullable(),
        background_color: z.string().optional().nullable(),
        logo_login_url: z.string().optional().nullable(),
        logo_url: z.string().optional().nullable(),
        logo_url_collapsed: z.string().optional().nullable(),
        navigation_color: z.string().optional().nullable(),
        paper_color: z.string().optional().nullable(),
        primary_color: z.string().optional().nullable(),
        secondary_color: z.string().optional().nullable(),
      }),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="themeForm" onSubmit={handleSubmit(onSubmit)}>

      <ColorPickerField
        variant="standard"
        fullWidth
        label={t('Background color')}
        placeholder={t('Default')}
        error={!!errors.background_color}
        helperText={errors.background_color && errors.background_color?.message}
        control={control}
        name="background_color"
      />
      &nbsp;
      <ColorPickerField
        variant="standard"
        fullWidth
        label={t('Paper color')}
        placeholder={t('Default')}
        error={!!errors.paper_color}
        helperText={errors.paper_color && errors.paper_color?.message}
        control={control}
        name="paper_color"
      />
      &nbsp;
      <ColorPickerField
        variant="standard"
        fullWidth
        label={t('Navigation color')}
        placeholder={t('Default')}
        error={!!errors.navigation_color}
        helperText={errors.navigation_color && errors.navigation_color?.message}
        control={control}
        name="navigation_color"
      />
      &nbsp;
      <ColorPickerField
        variant="standard"
        fullWidth
        label={t('Primary color')}
        placeholder={t('Default')}
        error={!!errors.primary_color}
        helperText={errors.primary_color && errors.primary_color?.message}
        control={control}
        name="primary_color"
      />
      &nbsp;
      <ColorPickerField
        variant="standard"
        fullWidth
        label={t('Secondary color')}
        placeholder={t('Default')}
        error={!!errors.secondary_color}
        helperText={errors.secondary_color && errors.secondary_color?.message}
        control={control}
        name="secondary_color"
      />
      &nbsp;
      <ColorPickerField
        variant="standard"
        fullWidth
        label={t('Accent color')}
        placeholder={t('Default')}
        error={!!errors.accent_color}
        helperText={errors.accent_color && errors.accent_color?.message}
        control={control}
        name="accent_color"
      />
      &nbsp;
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Logo URL')}
        placeholder={t('Default')}
        error={!!errors.logo_url}
        helperText={errors.logo_url && errors.logo_url?.message}
        inputProps={register('logo_url')}
      />
      &nbsp;
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Logo URL (collapsed)')}
        placeholder={t('Default')}
        error={!!errors.logo_url_collapsed}
        helperText={errors.logo_url_collapsed && errors.logo_url_collapsed?.message}
        inputProps={register('logo_url_collapsed')}
      />
      &nbsp;
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Logo URL (login)')}
        placeholder={t('Default')}
        error={!!errors.logo_login_url}
        helperText={errors.logo_login_url && errors.logo_login_url?.message}
        inputProps={register('logo_login_url')}
      />

      <div style={{ float: 'right', marginTop: 20 }}>
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

export default ThemeForm;
