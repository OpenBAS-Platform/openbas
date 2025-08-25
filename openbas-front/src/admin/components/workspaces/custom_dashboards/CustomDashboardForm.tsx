import { zodResolver } from '@hookform/resolvers/zod';
import { Add, DeleteOutlined } from '@mui/icons-material';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useMemo } from 'react';
import { FormProvider, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import SelectFieldController, { createItems, type Item } from '../../../../components/fields/SelectFieldController';
import TextFieldController from '../../../../components/fields/TextFieldController';
import { useFormatter } from '../../../../components/i18n';
import { type CustomDashboardInput, type CustomDashboardParametersInput } from '../../../../utils/api-types';
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
    custom_dashboard_parameters: [],
  },
  editing = false,
  handleClose,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  const parametersSchema = z.object({
    custom_dashboards_parameter_id: z.string().optional(),
    custom_dashboards_parameter_name: z.string().min(1, { message: t('Should not be empty') }),
    custom_dashboards_parameter_type: z.enum(['scenario', 'simulation']),
  });

  const validationSchema = useMemo(
    () =>
      zodImplement<CustomDashboardInput>().with({
        custom_dashboard_name: z.string().min(1, { message: t('Should not be empty') }),
        custom_dashboard_description: z.string().optional(),
        custom_dashboard_parameters: z.array(parametersSchema).optional(),
      }),
    [],
  );

  const methods = useForm<CustomDashboardInput>({
    mode: 'onTouched',
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
    control,
  } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom_dashboard_parameters',
  });

  const items: Item<CustomDashboardParametersInput['custom_dashboards_parameter_type']>[] = createItems(['scenario', 'simulation']);
  const handleAddParameter = (type: CustomDashboardParametersInput['custom_dashboards_parameter_type']) => {
    if (type) {
      append({
        custom_dashboards_parameter_name: type,
        custom_dashboards_parameter_type: type,
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        id="customDashboardForm"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          gap: theme.spacing(2),
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextFieldController
          variant="standard"
          name="custom_dashboard_name"
          label={t('Name')}
          required
        />
        <TextFieldController
          variant="standard"
          name="custom_dashboard_description"
          label={t('Description')}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}
        >
          <Typography variant="h3" sx={{ m: 0 }}>
            {t('Parameters')}
          </Typography>
          <IconButton
            color="secondary"
            aria-label="Add"
            onClick={() => handleAddParameter(items[0].value)}
            size="small"
          >
            <Add fontSize="small" />
          </IconButton>
        </div>
        {fields.map((field, index) => (
          <Box
            key={field.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing(2),
            }}
          >
            <TextFieldController
              name={`custom_dashboard_parameters.${index}.custom_dashboards_parameter_name`}
              label={t('Parameter Name')}
              variant="standard"
              required
              noHelperText
            />
            <SelectFieldController
              name={`custom_dashboard_parameters.${index}.custom_dashboards_parameter_type`}
              label={t('Parameter Type')}
              items={items}
              required
            />
            <Tooltip title={t('Delete')}>
              <IconButton color="error" onClick={() => remove(index)}>
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
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
    </FormProvider>
  );
};

export default CustomDashboardForm;
