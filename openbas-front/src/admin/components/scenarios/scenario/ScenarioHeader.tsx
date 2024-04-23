import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import cronstrue from 'cronstrue';
import { EditOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchScenario, updateScenarioRecurrence, updateScenarioTags } from '../../../../actions/scenarios/scenario-actions';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import ScenarioPopover from './ScenarioPopover';
import useScenarioPermissions from '../../../../utils/Scenario';
import ScenarioStatus from './ScenarioStatus';
import HeaderTags from './HeaderTags';
import { useFormatter } from '../../../../components/i18n';
import { parseCron, ParsedCron } from '../../../../utils/Cron';
import ScenarioRecurringFormDialog from './ScenarioRecurringFormDialog';

const useStyles = makeStyles(() => ({
  title: {
    textTransform: 'uppercase',
    marginBottom: 0,
  },
}));

// eslint-disable-next-line no-underscore-dangle
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

const ScenarioHeader = () => {
  // Standard hooks
  const { t, nsd, ft, locale } = useFormatter();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  // Fetching data
  const { scenario }: { scenario: ScenarioStore } = useHelper((helper: ScenariosHelper) => ({
    scenario: helper.getScenario(scenarioId),
  }));
  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
  });

  const [selectRecurring, setSelectRecurring] = useState('noRepeat');

  const [openScenarioRecurringFormDialog, setOpenScenarioRecurringFormDialog] = useState<boolean>(false);
  const [cronExpression, setCronExpression] = useState<string | null>(scenario.scenario_recurrence || null);
  const [parsedCronExpression, setParsedCronExpression] = useState<ParsedCron | null>(scenario.scenario_recurrence ? parseCron(scenario.scenario_recurrence) : null);

  const noRepeat = scenario.scenario_recurrence_end && scenario.scenario_recurrence_start
    && new Date(scenario.scenario_recurrence_end).getTime() - new Date(scenario.scenario_recurrence_start).getTime() <= _MS_PER_DAY
    && ['noRepeat', 'daily'].includes(selectRecurring);

  const ended = scenario.scenario_recurrence_end && new Date(scenario.scenario_recurrence_end).getTime() < new Date().getTime();

  const onSubmit = (cron: string, start: string, end?: string) => {
    setCronExpression(cron);
    setParsedCronExpression(parseCron(cron));
    dispatch(updateScenarioRecurrence(scenarioId, { scenario_recurrence: cron, scenario_recurrence_start: start, scenario_recurrence_end: end }));
    setOpenScenarioRecurringFormDialog(false);
  };

  useEffect(() => {
    if (scenario.scenario_recurrence != null) {
      setCronExpression(scenario.scenario_recurrence);
      setParsedCronExpression(parseCron(scenario.scenario_recurrence));
      const { w, d } = parseCron(scenario.scenario_recurrence);
      if (w) {
        setSelectRecurring('monthly');
      } else if (d) {
        setSelectRecurring('weekly');
      } else if (!noRepeat) {
        setSelectRecurring('daily');
      }
    }
  }, [scenario.scenario_recurrence]);
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
      sentence = `${t('recurrence_The')} ${nsd(scenario.scenario_recurrence_start)} ${t('recurrence_at')} ${ft(new Date().setUTCHours(parsedCronExpression.h, parsedCronExpression.m))}`;
    } else {
      sentence = cronstrue.toString(cronExpression, {
        verbose: true,
        tzOffset: -new Date().getTimezoneOffset() / 60,
        locale,
      });

      if (scenario.scenario_recurrence_end) {
        sentence += ` ${t('recurrence_from')} ${nsd(scenario.scenario_recurrence_start)}`;
        sentence += ` ${t('recurrence_to')} ${nsd(scenario.scenario_recurrence_end)}`;
      } else {
        sentence += ` ${t('recurrence_starting_from')} ${nsd(scenario.scenario_recurrence_start)}`;
      }
    }

    return sentence;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Typography
              variant="h1"
              gutterBottom
              classes={{ root: classes.title }}
            >
              {scenario.scenario_name}
            </Typography>
            <ScenarioStatus scenario={scenario} />
          </div>
          <ScenarioPopover scenario={scenario} />
        </div>
        <Stack flex={1} gap={2} justifyContent="space-between">
          <Box>
            <Stack direction="row" gap={1} alignItems="center" style={{ minHeight: 40 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{cronExpression ? t('Scheduled') : t('No scheduling')}</Typography>
              <Typography variant="body1">
                {
                  getHumanReadableScheduling()
                }
              </Typography>
              {
                scenario.scenario_recurrence && <IconButton onClick={() => setOpenScenarioRecurringFormDialog(true)} color="secondary"><EditOutlined fontSize="small" /></IconButton>
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
          initialValues={scenario}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <HeaderTags
          tags={scenario.scenario_tags}
          disabled={useScenarioPermissions(scenario.scenario_id).readOnly}
          updateTags={(tagIds: string[]) => updateScenarioTags(scenario.scenario_id, { scenario_tags: tagIds })}
        />
        <Box display="flex">
          <Stack direction="row" gap={2}>
            {
              scenario.scenario_recurrence
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
                  {t('Schedule')}
                </Button>
            }

          </Stack>
        </Box>
      </div>
    </div>
  );
};

export default ScenarioHeader;
