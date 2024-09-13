import React from 'react';
import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Button, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';

import type { ReportInput, ReportInformationInput, Report } from '../../../../../utils/api-types';
import { zodImplement } from '../../../../../utils/Zod';
import { useFormatter } from '../../../../../components/i18n';
import ReportInformationType from './ReportInformationType';

interface Props {
  onSubmit: SubmitHandler<ReportInput>;
  handleCancel: () => void;
  editing?: boolean;
  initialValues?: Report,
}

interface ExerciseReportFormInput {
  report_name: string;
  report_main_information: boolean;
  report_score_details: boolean;
  report_player_surveys: boolean;
  report_exercise_details: boolean;
}

const ExerciseReportForm: React.FC<Props> = ({
  onSubmit,
  handleCancel,
  editing,
  initialValues,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const findReportInfo = (type: string) => {
    return initialValues?.report_informations?.find((info) => info.report_informations_type === type)?.report_informations_display ?? true;
  };

  const initialFormValues: ExerciseReportFormInput = {
    report_name: initialValues?.report_name || '',
    report_main_information: findReportInfo(ReportInformationType.MAIN_INFORMATION),
    report_score_details: findReportInfo(ReportInformationType.SCORE_DETAILS),
    report_player_surveys: findReportInfo(ReportInformationType.PLAYER_SURVEYS),
    report_exercise_details: findReportInfo(ReportInformationType.EXERCISE_DETAILS),
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseReportFormInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<ExerciseReportFormInput>().with({
        report_name: z.string().min(1, { message: t('Should not be empty') }),
        report_main_information: z.boolean(),
        report_score_details: z.boolean(),
        report_player_surveys: z.boolean(),
        report_exercise_details: z.boolean(),
      }),
    ),
    defaultValues: initialFormValues,
  });

  const onSubmitHandler = (data: ExerciseReportFormInput) => {
    const reportInformationList: ReportInformationInput[] = [
      {
        report_informations_type: ReportInformationType.MAIN_INFORMATION,
        report_informations_display: data.report_main_information,
      },
      {
        report_informations_type: ReportInformationType.SCORE_DETAILS,
        report_informations_display: data.report_score_details,
      },
      {
        report_informations_type: ReportInformationType.PLAYER_SURVEYS,
        report_informations_display: data.report_player_surveys,
      },
      {
        report_informations_type: ReportInformationType.EXERCISE_DETAILS,
        report_informations_display: data.report_exercise_details,
      },
    ];
    onSubmit({ report_name: data.report_name, report_informations: reportInformationList });
  };

  return (
    <form
      id="reportExerciseForm"
      onSubmit={handleSubmit(onSubmitHandler)}
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}
    >
      <TextField
        variant="standard"
        sx={{ gridColumn: 'span 2' }}
        fullWidth={true}
        label={t('Name')}
        error={!!errors.report_name}
        helperText={errors.report_name && errors.report_name?.message}
        inputProps={register('report_name')}
      />
      <Typography
        variant="h4"
        gutterBottom
        sx={{ gridColumn: 'span 2', marginTop: '30px' }}
      >
        {t('Modules')}
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            {...register('report_main_information')}
            defaultChecked={initialFormValues?.report_main_information}
          />
        }
        label={t('General information')}
      />
      <FormControlLabel
        control={
          <Checkbox
            {...register('report_score_details')}
            defaultChecked={initialFormValues?.report_score_details}
          />
        }
        label={t('Score details')}
      />
      <FormControlLabel
        control={
          <Checkbox
            {...register('report_player_surveys')}
            defaultChecked={initialFormValues?.report_player_surveys}
          />
        }
        label={t('Player surveys')}
      />
      <FormControlLabel
        control={
          <Checkbox
            {...register('report_exercise_details')}
            defaultChecked={initialFormValues?.report_exercise_details}
          />
        }
        label={t('Exercise details')}
      />
      <div style={{ gridColumn: 'span 2', marginTop: '20px', display: 'flex' }}>
        <Button
          style={{ marginLeft: 'auto' }}
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {t('Cancel')}
        </Button>
        <Button
          color="secondary"
          type="submit"
          disabled={isSubmitting}
        >
          {editing ? t('Update') : t('Create')}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseReportForm;
