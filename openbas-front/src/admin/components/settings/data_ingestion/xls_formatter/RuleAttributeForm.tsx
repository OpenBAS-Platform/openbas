import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { RuleAttributeAddInput } from '../../../../../utils/api-types';
import { useFormatter } from '../../../../../components/i18n';
import { zodImplement } from '../../../../../utils/Zod';

interface Props {
  initialValues?: RuleAttributeAddInput;
}

const RuleAttributeForm: React.FC<Props> = ({
  initialValues = {
    rule_attribute_name: '',
    rule_attribute_columns: '',
    rule_attribute_default_value: '',
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const {
    register,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<RuleAttributeAddInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<RuleAttributeAddInput>().with({
        rule_attribute_name: z.string().min(1, { message: t('Should not be empty') }),
        rule_attribute_columns: z.string().min(1, { message: t('Should not be empty') }),
        rule_attribute_default_value: z.string().optional(),
      }),
    ),
    defaultValues: initialValues,
  });

  return (
    <>
      <form id="ruleAttributeForm">
        <TextField
          variant="standard"
          fullWidth
          label={t('Rule attribute name')}
          style={{ marginTop: 10 }}
          error={!!errors.rule_attribute_name}
          helperText={errors.rule_attribute_name?.message}
          inputProps={register('rule_attribute_name')}
          InputLabelProps={{ required: true }}
        />

        <TextField
          variant="standard"
          fullWidth
          label={t('Rule attribute columns')}
          style={{ marginTop: 10 }}
          error={!!errors.rule_attribute_columns}
          helperText={errors.rule_attribute_columns?.message}
          inputProps={register('rule_attribute_columns')}
          InputLabelProps={{ required: true }}
        />

        <TextField
          variant="standard"
          fullWidth
          label={t('Rule attribute default value')}
          style={{ marginTop: 10 }}
          error={!!errors.rule_attribute_default_value}
          helperText={errors.rule_attribute_default_value?.message}
          inputProps={register('rule_attribute_default_value')}
        />
      </form>
    </>
  );
};

export default RuleAttributeForm;
