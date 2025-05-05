import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button } from '@mui/material';
import { type FunctionComponent, useMemo } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import TextField from '../../../../components/fields/TextField';
import { useFormatter } from '../../../../components/i18n';
import type { CustomDashboardInput } from '../../../../utils/api-types';
import { zodImplement } from '../../../../utils/Zod';

interface Props {
  onSubmit: SubmitHandler<CustomDashboardInput>;
  initialValues?: CustomDashboardInput;
  editing?: boolean;
  handleClose: () => void;
}

const CustomDashboardForm: FunctionComponent<Props> = ({
  onSubmit,
  initialValues = {
    custom_dashboard_name: '',
    custom_dashboard_description: '',
  },
  editing = false,
  handleClose,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const validationSchema = useMemo(
    () =>
      zodImplement<CustomDashboardInput>().with({
        custom_dashboard_name: z.string().min(1, { message: t('Should not be empty') }),
        custom_dashboard_description: z.string().optional(),
      }),
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CustomDashboardInput>({
    mode: 'onTouched',
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  return (
    <form id="customDashboardForm" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        variant="standard"
        fullWidth
        label={t('Name')}
        sx={{ mt: 1 }}
        error={!!errors.custom_dashboard_name}
        helperText={errors.custom_dashboard_name?.message}
        inputProps={register('custom_dashboard_name')}
        InputLabelProps={{ required: true }}
      />
      <TextField
        variant="standard"
        fullWidth
        label={t('Description')}
        sx={{ mt: 2 }}
        error={!!errors.custom_dashboard_description}
        helperText={errors.custom_dashboard_description?.message}
        inputProps={register('custom_dashboard_description')}
      />
      <Box sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mt: 2,
      }}
      >
        <Button
          variant="contained"
          onClick={handleClose}
          sx={{ mr: 1 }}
          disabled={isSubmitting}
        >
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {editing ? t('Update') : t('Create')}
        </Button>
      </Box>
    </form>
  );
};

export default CustomDashboardForm;
