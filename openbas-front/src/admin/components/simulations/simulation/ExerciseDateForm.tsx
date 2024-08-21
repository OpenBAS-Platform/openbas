import React, { useState } from 'react';
import { Button, FormControlLabel, Stack, Switch } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ExerciseUpdateStartDateInput } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { zodImplement } from '../../../../utils/Zod';
import { minutesInFuture } from '../../../../utils/Time';

interface Props {
  onSubmit: SubmitHandler<ExerciseUpdateStartDateInput>;
  initialValues?: ExerciseUpdateStartDateInput;
  handleClose: () => void;
}

interface ExerciseStartDateAndTime {
  date: Date;
  time: Date;
}

// eslint-disable-next-line no-underscore-dangle
const _MS_DELAY_TOO_CLOSE = 1000 * 60 * 2;

const ExerciseDateForm: React.FC<Props> = ({
  onSubmit,
  handleClose,
  initialValues,
}) => {
  const { t } = useFormatter();

  const defaultFormValues = () => {
    if (initialValues?.exercise_start_date) {
      return ({ date: new Date(initialValues.exercise_start_date), time: new Date(initialValues.exercise_start_date) });
    }
    return ({
      date: new Date(new Date().setUTCHours(0, 0, 0, 0)),
      time: minutesInFuture(5).toDate(),
    });
  };

  const [checked, setChecked] = useState(!initialValues?.exercise_start_date);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const submit = (data: ExerciseStartDateAndTime) => {
    if (checked) {
      onSubmit({ exercise_start_date: '' });
    } else {
      const { date, time } = data;
      date.setHours(time.getHours());
      date.setMinutes(time.getMinutes());
      date.setSeconds(time.getSeconds());
      onSubmit({ exercise_start_date: date.toISOString() });
    }
  };

  const {
    control,
    handleSubmit,
    clearErrors,
    getValues,
  } = useForm<ExerciseStartDateAndTime>({
    defaultValues: defaultFormValues(),
    resolver: zodResolver(
      zodImplement<ExerciseStartDateAndTime>().with({
        date: z.any().refine(
          (data) => {
            if (!checked) {
              return !!data;
            }
            return true;
          },
          { message: t('Required') },
        ).refine(
          (data) => {
            if (!checked) {
              return data instanceof Date && data.getTime() >= new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime();
            }
            return true;
          },
          { message: t('Date should be at least today') },
        ),
        time: z.any().refine(
          (data) => {
            if (!checked) {
              return !!data;
            }
            return true;
          },
          { message: t('Required') },
        ).refine(
          (data) => {
            if (!checked) {
              return data instanceof Date && (new Date().getTime() + _MS_DELAY_TOO_CLOSE) < data.getTime();
            }
            return true;
          },
          { message: t('The time and start date do not match, as the time provided is either too close to the current moment or in the past') },
        ),
      }),
    ),
  });

  return (
    <form id="exerciseDateForm" onSubmit={handleSubmit(submit)}>
      <FormControlLabel
        control={<Switch onChange={handleChange} checked={checked} />}
        label={t('Manual launch')}
      />

      <Stack spacing={{ xs: 2 }}>
        <Controller
          control={control}
          name="date"
          render={({ field, fieldState }) => (
            <DatePicker
              views={['year', 'month', 'day']}
              label={t('Start date (optional)')}
              disabled={checked}
              minDate={new Date(new Date().setUTCHours(0, 0, 0, 0))}
              value={(field.value)}
              onChange={(date) => field.onChange(date)}
              onAccept={() => {
                clearErrors('time');
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                },
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="time"
          render={({ field, fieldState }) => (
            <TimePicker
              label={t('Scheduling_time')}
              openTo="hours"
              timeSteps={{ minutes: 15 }}
              skipDisabled
              thresholdToRenderTimeInASingleColumn={100}
              disabled={checked}
              closeOnSelect={false}
              value={field.value}
              minTime={new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() === new Date(getValues('date')).getTime() ? new Date() : undefined}
              onChange={(time) => field.onChange(time)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                },
              }}
            />
          )}
        />
      </Stack>

      <div style={{ float: 'right', marginTop: 20 }}>
        {handleClose && (
        <Button
          onClick={handleClose.bind(this)}
          style={{ marginRight: 10 }}
        >
          {t('Cancel')}
        </Button>
        )}
        <Button
          color="secondary"
          type="submit"
        >
          {t('Save')}
        </Button>
      </div>
    </form>
  );
};
export default ExerciseDateForm;
