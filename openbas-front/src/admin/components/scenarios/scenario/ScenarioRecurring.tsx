import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import cronstrue from 'cronstrue';
import { Edit } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import type { Scenario, ScenarioRecurrenceInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import { updateScenarioRecurrence } from '../../../../actions/scenarios/scenario-actions';
import { parseCron, type ParsedCron } from '../../../../utils/Cron';
import ScenarioRecurringFormDialog from './ScenarioRecurringFormDialog';

interface Props {
  scenarioId: Scenario['scenario_id'],
  initialValues: ScenarioRecurrenceInput
}

// eslint-disable-next-line no-underscore-dangle
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

const ScenarioRecurring: React.FC<Props> = ({ scenarioId, initialValues }) => {
  const { t, nsd, ft, locale } = useFormatter();

  const dispatch = useAppDispatch();
  const [openScenarioRecurringFormDialog, setOpenScenarioRecurringFormDialog] = useState<boolean>(false);
  const [selectRecurring, setSelectRecurring] = useState('noRepeat');
  const [cronExpression, setCronExpression] = useState<string | null>(initialValues.scenario_recurrence || null);
  const [parsedCronExpression, setParsedCronExpression] = useState<ParsedCron | null>(initialValues.scenario_recurrence ? parseCron(initialValues.scenario_recurrence) : null);

  const noRepeat = initialValues.scenario_recurrence_end && initialValues.scenario_recurrence_start
    && new Date(initialValues.scenario_recurrence_end).getTime() - new Date(initialValues.scenario_recurrence_start).getTime() <= _MS_PER_DAY
    && ['noRepeat', 'daily'].includes(selectRecurring);

  const ended = initialValues.scenario_recurrence_end && new Date(initialValues.scenario_recurrence_end).getTime() < new Date().getTime();

  const onSubmit = (cron: string, start: string, end?: string) => {
    setCronExpression(cron);
    setParsedCronExpression(parseCron(cron));
    dispatch(updateScenarioRecurrence(scenarioId, { scenario_recurrence: cron, scenario_recurrence_start: start, scenario_recurrence_end: end }));
    setOpenScenarioRecurringFormDialog(false);
  };

  useEffect(() => {
    if (initialValues.scenario_recurrence != null) {
      setCronExpression(initialValues.scenario_recurrence);
      setParsedCronExpression(parseCron(initialValues.scenario_recurrence));
      const { w, d } = parseCron(initialValues.scenario_recurrence);
      if (w) {
        setSelectRecurring('monthly');
      } else if (d) {
        setSelectRecurring('weekly');
      } else if (!noRepeat) {
        setSelectRecurring('daily');
      }
    }
  }, [initialValues.scenario_recurrence]);

  const stop = () => {
    setCronExpression(null);
    setParsedCronExpression(null);
    dispatch(updateScenarioRecurrence(scenarioId, { scenario_recurrence: undefined, scenario_recurrence_start: undefined, scenario_recurrence_end: undefined }));
  };

  const getHumanReadableScheduling = () => {
    if (!cronExpression || !parsedCronExpression) {
      return null;
    }
    let sentence = '';

    if (noRepeat) {
      sentence = `${t('recurrence_The')} ${nsd(initialValues.scenario_recurrence_start)} ${t('recurrence_at')} ${ft(new Date().setUTCHours(parsedCronExpression.h, parsedCronExpression.m))}`;
    } else {
      sentence = cronstrue.toString(cronExpression, {
        verbose: true,
        tzOffset: -new Date().getTimezoneOffset() / 60,
        locale,
      });

      if (initialValues.scenario_recurrence_end) {
        sentence += ` ${t('recurrence_from')} ${nsd(initialValues.scenario_recurrence_start)}`;
        sentence += ` ${t('recurrence_to')} ${nsd(initialValues.scenario_recurrence_end)}`;
      } else {
        sentence += ` ${t('recurrence_starting_from')} ${nsd(initialValues.scenario_recurrence_start)}`;
      }
    }

    return sentence;
  };

  return (
    <>
      <Stack flex={1} gap={2} justifyContent="space-between">
        <Box>
          <Stack direction="row" gap={1} alignItems="center">
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{cronExpression ? t('Scheduled') : t('No scheduling')}</Typography>
            <Typography variant="body1">
              {
                getHumanReadableScheduling()
              }
            </Typography>
            {
              initialValues.scenario_recurrence && <IconButton onClick={() => setOpenScenarioRecurringFormDialog(true)}><Edit /></IconButton>
            }
          </Stack>
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <Stack direction="row" gap={2}>
            {
              initialValues.scenario_recurrence
                ? <Button
                    fullWidth={false}
                    variant="contained"
                    color={ended ? 'primary' : 'error'}
                    onClick={stop}
                  >
                  {ended ? t('Reset') : t('Stop')}
                </Button>
                : <Button
                    fullWidth={false}
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenScenarioRecurringFormDialog(true)}
                  >
                  {t('Launch')}
                </Button>
            }

          </Stack>
        </Box>
      </Stack>
      <ScenarioRecurringFormDialog
        selectRecurring={selectRecurring}
        onSelectRecurring={setSelectRecurring}
        open={openScenarioRecurringFormDialog}
        setOpen={setOpenScenarioRecurringFormDialog}
        onSubmit={onSubmit}
        initialValues={initialValues}
      />
    </>
  );
};

export default ScenarioRecurring;
