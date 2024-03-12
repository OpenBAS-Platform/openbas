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
  errors: string;
  onSubmit: SubmitHandler<ThemeInput>;
  initialValues?: ThemeInput;
}

const ThemeForm: React.FC<Props> = ({
  onSubmit,
  initialValues = {
    accent_color: '',
    background_color: '',
    logo_login_url: '',
    logo_url: '',
    logo_url_collapsed: '',
    navigation_color: '',
    paper_color: '',
    primary_color: '',
    secondary_color: '',
  },
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
        accent_color: z.string().optional(),
        background_color: z.string().optional(),
        logo_login_url: z.string().optional(),
        logo_url: z.string().optional(),
        logo_url_collapsed: z.string().optional(),
        navigation_color: z.string().optional(),
        paper_color: z.string().optional(),
        primary_color: z.string().optional(),
        secondary_color: z.string().optional(),
      }),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="themeForm" onSubmit={handleSubmit(onSubmit)}>

      <ColorPickerField
        variant="standard"
        fullWidth
        label={'Background color'}
        placeholder={'Default'}
        error={!!errors.background_color}
        helperText={errors.background_color && errors.background_color?.message}
        control={control}
        name="background_color"
      />

      <ColorPickerField
        variant="standard"
        fullWidth
        label={'Paper color'}
        placeholder={'Default'}
        error={!!errors.paper_color}
        helperText={errors.paper_color && errors.paper_color?.message}
        control={control}
        name="paper_color"
      />

      <ColorPickerField
        variant="standard"
        fullWidth
        label={'Navigation color'}
        placeholder={'Default'}
        error={!!errors.navigation_color}
        helperText={errors.navigation_color && errors.navigation_color?.message}
        control={control}
        name="navigation_color"
      />

      <ColorPickerField
        variant="standard"
        fullWidth
        label={'Primary color'}
        placeholder={'Default'}
        error={!!errors.primary_color}
        helperText={errors.primary_color && errors.primary_color?.message}
        control={control}
        name="primary_color"
      />
      <ColorPickerField
        variant="standard"
        fullWidth
        label={'Secondary color'}
        placeholder={'Default'}
        error={!!errors.secondary_color}
        helperText={errors.secondary_color && errors.secondary_color?.message}
        control={control}
        name="secondary_color"
      />

      <ColorPickerField
        variant="standard"
        fullWidth
        label={'Accent color'}
        placeholder={'Default'}
        error={!!errors.accent_color}
        helperText={errors.accent_color && errors.accent_color?.message}
        control={control}
        name="accent_color"
      />

      <MuiTextField
        variant="standard"
        fullWidth
        label={'Logo URL'}
        placeholder={'Default'}
        error={!!errors.logo_url}
        helperText={errors.logo_url && errors.logo_url?.message}
        inputProps={register('logo_url')}
      />

      <MuiTextField
        variant="standard"
        fullWidth
        label={'Logo URL (collapsed)'}
        placeholder={'Default'}
        error={!!errors.logo_url_collapsed}
        helperText={errors.logo_url_collapsed && errors.logo_url_collapsed?.message}
        inputProps={register('logo_url_collapsed')}
      />

      <MuiTextField
        variant="standard"
        fullWidth
        label={'Logo URL (login)'}
        placeholder={'Default'}
        error={!!errors.logo_login_url}
        helperText={errors.logo_login_url && errors.logo_login_url?.message}
        inputProps={register('logo_login_url')}
      />

      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          color="secondary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {t('Submit')}
        </Button>
      </div>
    </form>
  );
};

export default ThemeForm;
