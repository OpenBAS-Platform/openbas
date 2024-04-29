import React, { FunctionComponent } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, MenuItem } from '@mui/material';
import { zodImplement } from '../../../utils/Zod';
import type { ScenarioInput } from '../../../utils/api-types';
import { useFormatter } from '../../../components/i18n';
import TagField from '../../../components/fields/TagField';
import TextField from '../../../components/fields/TextField';
import SelectField from '../../../components/fields/SelectField';

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
    scenario_category: 'attack-scenario',
    scenario_main_focus: 'incident-response',
    scenario_severity: 'high',
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
        scenario_category: z.string().optional(),
        scenario_main_focus: z.string().optional(),
        scenario_severity: z.string().optional(),
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
      <SelectField
        variant="standard"
        fullWidth={true}
        name='scenario_category'
        label={t('Category')}
        style={{ marginTop: 20 }}
        error={!!errors.scenario_category}
        control={control}
        defaultValue={initialValues.scenario_category}
      >
        <MenuItem key="global-crisis" value="global-crisis">
          {t('Global Crisis')}
        </MenuItem>
        <MenuItem key="attack-scenario" value="attack-scenario">
          {t('Attack Scenario')}
        </MenuItem>
        <MenuItem key="media-pressure" value="media-pressure">
          {t('Media Pressure')}
        </MenuItem>
        <MenuItem key="data-exfiltration" value="data-exfiltration">
          {t('Data Exfiltration')}
        </MenuItem>
        <MenuItem key="capture-the-flag" value="capture-the-flag">
          {t('Capture The Flag')}
        </MenuItem>
        <MenuItem key="vulnerability-exploitation" value="vulnerability-exploitation">
          {t('Vulnerability Exploitation')}
        </MenuItem>
        <MenuItem key="lateral-movement" value="lateral-movement">
          {t('Lateral Movement')}
        </MenuItem>
        <MenuItem key="url-filtering" value="url-filtering">
          {t('URL Filtering')}
        </MenuItem>
      </SelectField>
      <SelectField
        variant="standard"
        fullWidth={true}
        name='scenario_main_focus'
        label={t('Main focus')}
        style={{ marginTop: 20 }}
        error={!!errors.scenario_main_focus}
        control={control}
        defaultValue={initialValues.scenario_main_focus}
      >
        <MenuItem key="endpoint-protection" value="endpoint-protection">
          {t('Endpoint Protection')}
        </MenuItem>
        <MenuItem key="web-filtering" value="web-filtering">
          {t('Web Filtering')}
        </MenuItem>
        <MenuItem key="incident-response" value="incident-response">
          {t('Incident Response')}
        </MenuItem>
        <MenuItem key="standard-operating-procedure" value="standard-operating-procedure">
          {t('Standard Operating Procedures')}
        </MenuItem>
        <MenuItem key="crisis-communication" value="crisis-communication">
          {t('Crisis Communication')}
        </MenuItem>
        <MenuItem key="strategic-reaction" value="strategic-reaction">
          {t('Strategic Reaction')}
        </MenuItem>
      </SelectField>
      <SelectField
        variant="standard"
        fullWidth={true}
        name='scenario_severity'
        label={t('Severity')}
        style={{ marginTop: 20 }}
        error={!!errors.scenario_severity}
        control={control}
        defaultValue={initialValues.scenario_severity}
      >
        <MenuItem key="low" value="low">
          {t('Low')}
        </MenuItem>
        <MenuItem key="medium" value="medium">
          {t('Medium')}
        </MenuItem>
        <MenuItem key="high" value="high">
          {t('High')}
        </MenuItem>
        <MenuItem key="critical" value="critical">
          {t('Critical')}
        </MenuItem>
      </SelectField>
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
