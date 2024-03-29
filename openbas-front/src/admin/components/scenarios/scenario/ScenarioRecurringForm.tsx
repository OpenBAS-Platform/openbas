import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import cronstrue from 'cronstrue';
import { DateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';
import crontime from 'cron-time-generator';
import cronparser from 'cron-parser';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';
import type { Scenario, ScenarioRecurrenceInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import { updateScenarioRecurrence } from '../../../../actions/scenarios/scenario-actions';
import { zodImplement } from '../../../../utils/Zod';

interface Props {
  scenarioId: Scenario['scenario_id'],
  initialValues: ScenarioRecurrenceInput
}

interface DailyRecurrence {
  startDate: string,
  time: string
}

const ScenarioRecurringForm: React.FC<Props> = ({ scenarioId, initialValues }) => {
  const { t, locale } = useFormatter();

  const dispatch = useAppDispatch();
  const [openDaily, setOpenDaily] = useState(false);
  const [selectRecurring, setSelectRecurring] = useState('no');
  const [cronExpression, setCronExpression] = useState<string | null>(initialValues.scenario_recurrence || null);

  const interval = initialValues.scenario_recurrence ? cronparser.parseExpression(initialValues.scenario_recurrence) : null;

  useEffect(() => {
    if (interval) {
      if (interval.fields.dayOfWeek.length === 8) {
        setSelectRecurring('daily');
      }
    }
  }, []);

  const onSubmitDaily = (data: { startDate: string, time: string }) => {
    const cron = crontime.everyDayAt(new Date(data.time).getUTCHours(), new Date(data.time).getUTCMinutes());
    setCronExpression(cron);
    dispatch(updateScenarioRecurrence(scenarioId, { scenario_recurrence: cron, scenario_recurrence_start: data.startDate }));
    setOpenDaily(false);
  };

  const { handleSubmit: handleSubmitDaily, control: controlDaily } = useForm<DailyRecurrence>({
    defaultValues: {
      startDate: initialValues.scenario_recurrence_start || new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString(),
      time: (interval ? new Date(new Date().setUTCHours(interval.fields.hour[0], interval.fields.minute[0])) : new Date()).toISOString(),
    },
    resolver: zodResolver(
      zodImplement<DailyRecurrence>().with({
        startDate: z.string(),
        time: z.string(),
      }).refine(
        (data) => {
          return !(new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() === new Date(data.startDate).getTime() && (new Date().getTime() + 3 * 60000) > new Date(data.time).getTime());
        },
        {
          message: t('Mismatch between time and start date (time too close from now or in the past)'),
          path: ['time'],
        },
      ),
    ),
  });

  return (
    <>
      <FormControl>
        <Select
          value={selectRecurring}
          label={t('Recurrence')}
          onChange={(event: SelectChangeEvent) => {
            setSelectRecurring(event.target.value);
          }}
          renderValue={(value) => {
            if (value === 'no' || !cronExpression) {
              return t('Does not repeat');
            }
            return cronstrue.toString(cronExpression, { verbose: true, tzOffset: -new Date().getTimezoneOffset() / 60, locale });
          }}
        >
          <MenuItem value="no" onClick={() => {
            setCronExpression(null);
          }}
          >{t('Does not repeat')}</MenuItem>
          <MenuItem value="daily" onClick={() => {
            setOpenDaily(true);
          }}
          >{t('Daily')}</MenuItem>
          <MenuItem value="weekly">{t('Weekly')}</MenuItem>
          <MenuItem value="monthly">{t('Monthly')}</MenuItem>
        </Select>
      </FormControl>
      <Dialog
        open={openDaily}
        onClose={() => {
          setOpenDaily(false);
          setSelectRecurring('no');
        }}
        TransitionComponent={Transition}
        PaperProps={{ elevation: 1 }}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleSubmitDaily(onSubmitDaily)}>
          <DialogTitle> {t('Set daily recurrence')}</DialogTitle>
          <DialogContent>
            <Stack spacing={{ xs: 2 }}>
              <Controller
                control={controlDaily}
                name="startDate"
                render={({ field, fieldState }) => (
                  <DateTimePicker
                    views={['year', 'month', 'day']}
                    value={field.value}
                    minDate={new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()}
                    onChange={(startDate) => {
                      return (startDate ? field.onChange(new Date(startDate).toISOString()) : field.onChange(null));
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error && fieldState.error?.message,
                      },
                    }}
                    label={t('Start date')}
                  />
                )}
              />
              <Controller
                control={controlDaily}
                name="time"
                render={({ field, fieldState }) => (
                  <TimePicker
                    label={t('Hour')}
                    openTo="hours"
                    value={field.value}
                    onChange={(time) => (time ? field.onChange(new Date(time).toISOString()) : field.onChange(null))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error && fieldState.error?.message,
                      },
                    }}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDaily(false);
              setSelectRecurring('no');
            }}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              type="submit"
            >
              {t('Save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default ScenarioRecurringForm;
