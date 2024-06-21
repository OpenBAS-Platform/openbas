import React from 'react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, MenuItem } from '@mui/material';
import { useFormatter } from '../../../../../components/i18n';
import { zodImplement } from '../../../../../utils/Zod';
import type { InjectImporterAddInput } from '../../../../../utils/api-types';

interface Props {
  initialValues?: InjectImporterAddInput;
  // onDelete: () => void;
}

const InjectImporterForm: React.FC<Props> = ({
  initialValues = {
    inject_importer_injector_contract_id: '',
    inject_importer_name: '',
    inject_importer_type_value: '',
    inject_importer_rule_attributes: [],
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const {
    register,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<InjectImporterAddInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<InjectImporterAddInput>().with({
        inject_importer_name: z.string().min(1, { message: t('Should not be empty') }),
        inject_importer_type_value: z.string().min(1, { message: t('Should not be empty') }),
        inject_importer_injector_contract_id: z.string().min(1, { message: t('Should not be empty') }),
        inject_importer_rule_attributes: z.any().array().optional(),
      }),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="injectImporterForm">
      <TextField
        variant="standard"
        fullWidth
        label={t('Inject importer name')}
        style={{ marginTop: 10 }}
        error={!!errors.inject_importer_name}
        helperText={errors.inject_importer_name?.message}
        inputProps={register('inject_importer_name')}
        InputLabelProps={{ required: true }}
      />

      <TextField
        variant="standard"
        fullWidth
        label={t('Inject importer type')}
        style={{ marginTop: 10 }}
        error={!!errors.inject_importer_type_value}
        helperText={errors.inject_importer_type_value?.message}
        inputProps={register('inject_importer_type_value')}
        InputLabelProps={{ required: true }}
      />

      <Controller
        control={control}
        name="inject_importer_injector_contract_id"
        render={({ field }) => (
          <TextField
            select
            variant="standard"
            fullWidth
            label={t('Inject importer injector contract')}
            style={{ marginTop: 10 }}
            value={field.value}
            error={!!errors.inject_importer_injector_contract_id}
            helperText={errors.inject_importer_injector_contract_id?.message}
            inputProps={register('inject_importer_injector_contract_id')}
            InputLabelProps={{ required: true }}
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
          </TextField>
        )}
      />

      <TextField
        variant="standard"
        fullWidth
        label={t('Inject importer rules')}
        style={{ marginTop: 10 }}
        error={!!errors.inject_importer_rule_attributes}
        helperText={errors.inject_importer_rule_attributes?.message}
        inputProps={register('inject_importer_rule_attributes')}
      />
    </form>
  );
};

export default InjectImporterForm;
