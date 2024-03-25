import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputAdornment, MenuItem, Select, SelectChangeEvent, Stack, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import cronstrue from 'cronstrue';
import { DateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { makeStyles } from '@mui/styles';
import { Controller, useForm } from 'react-hook-form';
import CronTime from 'cron-time-generator';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';
import { zodImplement } from '../../../../utils/Zod';
import type { VariableInput } from '../../../../utils/api-types';

const useStyles = makeStyles({});

const ScenarioRecurringForm = () => {
  const { t, locale } = useFormatter();
  const classes = useStyles();
  // const [openModal, setOpenModal] = useState(false);
  const [openDaily, setOpenDaily] = useState(false);
  const [recurringTime, setRecurringTime] = useState('no');
  const [cronExpression, setCronExpression] = useState<string | null>(null);

  console.log('');

  // useEffect(() => {
  //   if (openModal) {
  //     switch (recurringTime) {
  //       case 'daily':
  //         setOpenDaily(true);
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  //   setOpenModal(false);
  // }, [openModal]);

  const onSubmitDaily = (test) => {
    setCronExpression(CronTime.everyDayAt(new Date(test.time).getUTCHours(), new Date(test.time).getUTCMinutes()));

    setOpenDaily(false);
  };

  const { register: registerDaily, handleSubmit: handleSubmitDaily, control: controlDaily } = useForm<any>({
    defaultValues: {
      date: new Date().setUTCHours(0, 0, 0, 0),
      time: new Date(),
      repeat: 1,
    },
  });

  return (
    <>
      <FormControl>
        <Select
          value={recurringTime}
          label={t('Recurrence')}
          onChange={(event: SelectChangeEvent) => {
            setRecurringTime(event.target.value);
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
          setRecurringTime('no');
        }}
        TransitionComponent={Transition}
        PaperProps={{ elevation: 1 }}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleSubmitDaily(onSubmitDaily)}>
          <DialogTitle> {t('Set recurrence')}</DialogTitle>
          <DialogContent>
            <Stack spacing={{ xs: 2 }}>
              <Controller
                control={controlDaily}
                name="date"
                render={({ field }) => (
                  <DateTimePicker
                    views={['year', 'month', 'day']}
                    value={field.value}
                    inputRef={field.ref}
                    minDate={new Date().setUTCHours(0, 0, 0, 0)}
                    onChange={(date) => (date ? field.onChange(date.toISOString()) : field.onChange(null))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                    label={t('Start date')}
                  />
                )}
              />
              <Controller
                control={controlDaily}
                name="time"
                render={({ field }) => (
                  <TimePicker
                    label={t('Hour')}
                    openTo="hours"
                    value={field.value}
                    inputRef={field.ref}
                    onChange={(date) => (date ? field.onChange(date.toISOString()) : field.onChange(null))}
                    slotProps={{
                      textField: {
                        fullWidth: true,
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
              setRecurringTime('no');
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
