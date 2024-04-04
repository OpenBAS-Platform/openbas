import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import cronstrue from 'cronstrue';
import { DateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';
import { CronTime } from 'cron-time-generator';
import cronparser, { CronExpression } from 'cron-parser';
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

interface Recurrence {
  startDate: string,
  time: string,
  dayOfWeek?: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  weekOfMonth?: 1 | 2 | 3 | 4,
}

const weekOfMonthToCron = {
  1: {
    start: 1,
    end: 7,
  },
  2: {
    start: 8,
    end: 14,
  },
  3: {
    start: 15,
    end: 21,
  },
  4: {
    start: 22,
    end: 28,
  },
};

const cronToWeekOfMonth = (cron: number | string) => {
  switch (cron) {
    case 8:
      return 2;
    case 15:
      return 3;
    case 22:
      return 4;
    default:
      return 1;
  }
};

const getInitialValues = (scenarioRecurrenceStart: string | undefined, cronInterval: CronExpression | null) => ({
  startDate: scenarioRecurrenceStart
    || new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString(),
  time:
    (cronInterval ? new Date(new Date().setUTCHours(cronInterval.fields.hour[0], cronInterval.fields.minute[0])) : new Date(new Date().getTime() + 4 * 60000))
      .toISOString(),
  dayOfWeek:
    cronInterval ? cronInterval.fields.dayOfWeek[0] as Recurrence['dayOfWeek'] : 1,
  weekOfMonth:
    cronInterval ? cronToWeekOfMonth(cronInterval.fields.dayOfMonth[0]) : 1 as Recurrence['weekOfMonth'],
});
const ScenarioRecurringForm: React.FC<Props> = ({ scenarioId, initialValues }) => {
  const { t, locale } = useFormatter();

  const dispatch = useAppDispatch();
  const [openDaily, setOpenDaily] = useState(false);
  const [openWeekly, setOpenWeekly] = useState(false);
  const [openMonthly, setOpenMonthly] = useState(false);
  const [selectRecurring, setSelectRecurring] = useState('no');
  const [cronInterval, setCronInterval] = useState<CronExpression | null>(initialValues.scenario_recurrence ? cronparser.parseExpression(initialValues.scenario_recurrence) : null);
  const [cronExpression, setCronExpression] = useState<string | null>(initialValues.scenario_recurrence || null);
  const prevScenarioRecurrencenRef = useRef<string | undefined>(initialValues.scenario_recurrence);

  const closeDialog = () => {
    setOpenDaily(false);
    setOpenWeekly(false);
    setOpenMonthly(false);
  };

  const onSubmit = (data: Recurrence) => {
    let cron;
    if (openDaily) {
      cron = CronTime.everyDayAt(new Date(data.time).getUTCHours(), new Date(data.time).getUTCMinutes());
      setSelectRecurring('daily');
    } else if (openWeekly) {
      cron = CronTime.everyWeekAt(data.dayOfWeek!, new Date(data.time).getUTCHours(), new Date(data.time).getUTCMinutes());
      setSelectRecurring('weekly');
    } else {
      cron = CronTime.between(
        weekOfMonthToCron[data.weekOfMonth!].start,
        weekOfMonthToCron[data.weekOfMonth!].end,
      ).days(
        new Date(data.time).getUTCHours(),
        new Date(data.time).getUTCMinutes(),
      ).slice(0, -1) + data.dayOfWeek!;
      setSelectRecurring('monthly');
    }
    setCronExpression(cron);
    dispatch(updateScenarioRecurrence(scenarioId, { scenario_recurrence: cron, scenario_recurrence_start: data.startDate }));
    closeDialog();
  };

  const { handleSubmit, control, reset } = useForm<Recurrence>({
    defaultValues: getInitialValues(initialValues.scenario_recurrence_start, cronInterval),
    resolver: zodResolver(
      zodImplement<Recurrence>().with({
        startDate: z.string(),
        time: z.string(),
        // @ts-expect-error zodImplement cannot handle refine
        dayOfWeek: z.number().optional().refine((value) => {
          if (openWeekly || openMonthly) {
            return value !== null;
          }
          return true;
        }, { message: t('Required') }),
        // @ts-expect-error zodImplement cannot handle refine
        weekOfMonth: z.number().optional().refine((value) => {
          if (openMonthly) {
            return value !== null;
          }
          return true;
        }, { message: t('Required') }),
      }).refine(
        (data) => {
          return new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() !== new Date(data.startDate).getTime()
            || (new Date().getTime() + 3 * 60000) < new Date(data.time).getTime();
        },
        {
          message: t('Mismatch between time and start date (time too close from now or in the past)'),
          path: ['time'],
        },
      ),
    ),
  });

  useEffect(() => {
    if (prevScenarioRecurrencenRef.current === undefined && initialValues.scenario_recurrence !== undefined && initialValues.scenario_recurrence !== null) {
      setCronExpression(initialValues.scenario_recurrence);
      setCronInterval(cronparser.parseExpression(initialValues.scenario_recurrence));
      reset(getInitialValues(initialValues.scenario_recurrence_start, cronInterval));
    }
    prevScenarioRecurrencenRef.current = initialValues.scenario_recurrence;
  }, [initialValues.scenario_recurrence]);

  useEffect(() => {
    if (cronInterval) {
      if (cronInterval.fields.dayOfWeek.length === 8) {
        setSelectRecurring('daily');
      }
      if (cronInterval.fields.dayOfWeek.length === 1) {
        setSelectRecurring('weekly');
      }
      if (cronInterval.fields.dayOfMonth.length === 7) {
        setSelectRecurring('monthly');
      }
    }
  }, [cronInterval]);

  return (
    <>
      <FormControl>
        <Select
          value={selectRecurring}
          label={t('Recurrence')}
          renderValue={(value) => {
            if (value === 'no' || !cronExpression) {
              return t('Does not repeat');
            }
            return cronstrue.toString(cronExpression, { verbose: true, tzOffset: -new Date().getTimezoneOffset() / 60, locale });
          }}
        >
          <MenuItem value="no" onClick={() => {
            setCronExpression(null);
            setSelectRecurring('no');
            dispatch(updateScenarioRecurrence(scenarioId, { scenario_recurrence: undefined, scenario_recurrence_start: undefined }));
          }}
          >{t('Does not repeat')}</MenuItem>
          <MenuItem value="daily" onClick={() => {
            setOpenDaily(true);
          }}
          >{t('Daily')}</MenuItem>
          <MenuItem value="weekly" onClick={() => {
            setOpenWeekly(true);
          }}
          >{t('Weekly')}</MenuItem>
          <MenuItem value="monthly" onClick={() => {
            setOpenMonthly(true);
          }}
          >{t('Monthly')}</MenuItem>
        </Select>
      </FormControl>
      <Dialog
        open={openDaily || openWeekly || openMonthly}
        onClose={closeDialog}
        TransitionComponent={Transition}
        PaperProps={{ elevation: 1 }}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{(openDaily && t('Set daily recurrence')) || (openWeekly && t('Set weekly recurrence')) || (openMonthly && t('Set monthly recurrence'))}</DialogTitle>
          <DialogContent>
            <Stack spacing={{ xs: 2 }}>
              <Controller
                control={control}
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
              {
                openMonthly
                && <Controller
                  control={control}
                  name="weekOfMonth"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>{t('Week of month')}</InputLabel>
                      <Select
                        value={field.value}
                        label={t('Week of month')}
                        onChange={field.onChange}
                      >
                        <MenuItem value={1}>{t('First')}</MenuItem>
                        <MenuItem value={2}>{t('Second')}</MenuItem>
                        <MenuItem value={3}>{t('Third')}</MenuItem>
                        <MenuItem value={4}>{t('Fourth')}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                   />
              }
              {
                (openWeekly || openMonthly)
                && <Controller
                  control={control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>{t('Day of week')}</InputLabel>
                      <Select
                        value={field.value}
                        label={t('Day of week')}
                        onChange={field.onChange}
                      >
                        <MenuItem value={1}>{t('Monday')}</MenuItem>
                        <MenuItem value={2}>{t('Tuesday')}</MenuItem>
                        <MenuItem value={3}>{t('Wednesday')}</MenuItem>
                        <MenuItem value={4}>{t('Thursday')}</MenuItem>
                        <MenuItem value={5}>{t('Friday')}</MenuItem>
                        <MenuItem value={6}>{t('Saturday')}</MenuItem>
                        <MenuItem value={7}>{t('Sunday')}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                   />
              }
              <Controller
                control={control}
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
            <Button onClick={closeDialog}>
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
