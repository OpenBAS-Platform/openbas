import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect } from 'react';
import { Button, Tooltip, Typography } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import { PlayArrowOutlined, Stop } from '@mui/icons-material';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchScenario, updateScenarioRecurrence } from '../../../../actions/scenarios/scenario-actions';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import ScenarioPopover from './ScenarioPopover';
import { useFormatter } from '../../../../components/i18n';
import { parseCron, ParsedCron } from '../../../../utils/Cron';
import ScenarioRecurringFormDialog from './ScenarioRecurringFormDialog';
import { truncate } from '../../../../utils/String';
import type { Theme } from '../../../../components/Theme';

const useStyles = makeStyles(() => ({
  title: {
    float: 'left',
    marginRight: 10,
  },
  statusScheduled: {
    float: 'left',
    margin: '4px 0 0 5px',
    width: 20,
    height: 20,
    borderRadius: '50%',
    boxShadow: '0px 0px 5px 2px #4caf50',
    animation: 'pulse-green 1s linear infinite alternate',
  },
  statusNotScheduled: {
    float: 'left',
    margin: '4px 0 0 5px',
    width: 20,
    height: 20,
    borderRadius: '50%',
    boxShadow: '0px 0px 5px 2px #f44336',
  },
  actions: {
    margin: '-6px 0 0 0',
    float: 'right',
    display: 'flex',
  },
}));

interface ScenarioHeaderProps {
  setCronExpression: React.Dispatch<React.SetStateAction<string | null>>;
  setParsedCronExpression: React.Dispatch<React.SetStateAction<ParsedCron | null>>;
  setSelectRecurring: React.Dispatch<React.SetStateAction<string>>;
  selectRecurring: string;
  setOpenScenarioRecurringFormDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openScenarioRecurringFormDialog: boolean,
  noRepeat: boolean;
}

const ScenarioHeader = ({
  setCronExpression,
  setParsedCronExpression,
  setSelectRecurring,
  selectRecurring,
  noRepeat,
  openScenarioRecurringFormDialog,
  setOpenScenarioRecurringFormDialog,
}: ScenarioHeaderProps) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  // Fetching data
  const { scenario }: { scenario: ScenarioStore } = useHelper((helper: ScenariosHelper) => ({
    scenario: helper.getScenario(scenarioId),
  }));
  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
  });

  // Local
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

  return (
    <>
      <Tooltip title={scenario.scenario_name}>
        <Typography variant="h1" gutterBottom={true} classes={{ root: classes.title }}>
          {truncate(scenario.scenario_name, 80)}
        </Typography>
      </Tooltip>
      <div style={{ float: 'left', margin: '4px 10px 0 8px', color: theme.palette.text?.disabled, borderLeft: `1px solid ${theme.palette.text?.disabled}`, height: 20 }} />
      <Tooltip title={t(scenario.scenario_recurrence ? 'Scheduled' : 'Not scheduled')}>
        <div className={scenario.scenario_recurrence ? classes.statusScheduled : classes.statusNotScheduled} />
      </Tooltip>
      <div className={classes.actions}>
        {scenario.scenario_recurrence && !ended ? (
          <Button
            style={{ marginRight: 10 }}
            startIcon={<Stop />}
            variant="outlined"
            color="inherit"
            size="small"
            onClick={stop}
          >
            {t('Stop')}
          </Button>
        ) : (
          <Button
            style={{ marginRight: 10, lineHeight: 'initial' }}
            startIcon={<PlayArrowOutlined />}
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setOpenScenarioRecurringFormDialog(true)}
          >
            {t('Launch')}
          </Button>
        )}
        <ScenarioPopover
          scenario={scenario}
          actions={['Duplicate', 'Update', 'Delete', 'Export']}
          onDelete={() => navigate('/admin/scenarios')}
        />
      </div>
      <ScenarioRecurringFormDialog
        selectRecurring={selectRecurring}
        onSelectRecurring={setSelectRecurring}
        open={openScenarioRecurringFormDialog}
        setOpen={setOpenScenarioRecurringFormDialog}
        onSubmit={onSubmit}
        initialValues={scenario}
      />
      <div className="clearfix" />
    </>
  );
};

export default ScenarioHeader;
