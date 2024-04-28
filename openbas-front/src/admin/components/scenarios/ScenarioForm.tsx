import React, { FunctionComponent } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@mui/material';
import { zodImplement } from '../../../utils/Zod';
import type { ScenarioInput } from '../../../utils/api-types';
import { useFormatter } from '../../../components/i18n';
import TagField from '../../../components/fields/TagField';
import TextField from '../../../components/fields/TextField';

interface Props {
  onSubmit: SubmitHandler<ScenarioInput>;
  handleClose: () => void;
  editing?: boolean;
  initialValues?: ScenarioInput;
}

const ScenarioForm: FunctionComponent<Props> = ({
  onSubmit,
  handleClose,
  editing,
  initialValues = {
    scenario_name: '',
    scenario_subtitle: '',
    scenario_description: '',
    scenario_tags: [],
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    setValue,
  } = useForm<ScenarioInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<ScenarioInput>().with({
        scenario_name: z.string().min(1, { message: t('Should not be empty') }),
        scenario_subtitle: z.string().optional(),
        scenario_description: z.string().optional(),
        scenario_tags: z.string().array().optional(),
      }),
    ),
    defaultValues: initialValues,
  });
  return (
    <form id="scenarioForm" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        variant="standard"
        fullWidth
        label={t('Name')}
        error={!!errors.scenario_name}
        helperText={errors.scenario_name?.message}
        inputProps={register('scenario_name')}
        InputLabelProps={{ required: true }}
        control={control}
        setValue={setValue}
        askAi={true}
      />
      <TextField
        variant="standard"
        fullWidth
        label={t('Subtitle')}
        style={{ marginTop: 20 }}
        error={!!errors.scenario_subtitle}
        helperText={errors.scenario_subtitle?.message}
        inputProps={register('scenario_subtitle')}
        control={control}
        setValue={setValue}
        askAi={true}
      />
      <TextField
        variant="standard"
        fullWidth
        multiline
        rows={5}
        label={t('Description')}
        style={{ marginTop: 20 }}
        error={!!errors.scenario_description}
        helperText={errors.scenario_description?.message}
        inputProps={register('scenario_description')}
        control={control}
        setValue={setValue}
        askAi={true}
      />
      <Controller
        control={control}
        name="scenario_tags"
        render={({ field: { onChange, value } }) => (
          <TagField
            name="scenarios_tags"
            label={t('Tags')}
            fieldValue={value ?? []}
            fieldOnChange={onChange}
            errors={errors}
            style={{ marginTop: 20 }}
          />
        )}
      />
      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          variant="contained"
          onClick={handleClose}
          style={{ marginRight: 10 }}
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
      </div>
    </form>
  );
};

export default ScenarioForm;
