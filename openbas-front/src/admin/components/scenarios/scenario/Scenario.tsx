import { useNavigate, useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Grid, Paper, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { CreateOutlined, GroupsOutlined, NotificationsOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchScenario, fetchScenarioTeams, toExercise, updateScenarioInformation, updateScenario } from '../../../../actions/scenarios/scenario-actions';
import { useFormatter } from '../../../../components/i18n';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import type { TeamStore } from '../../../../actions/teams/Team';
import type { Exercise, ScenarioInformationInput } from '../../../../utils/api-types';
import useScenarioPermissions from '../../../../utils/Scenario';
import Transition from '../../../../components/common/Transition';
import ScenarioInjectsDistribution from '../../injects/ScenarioInjectsDistribution';
import SettingsForm, { SettingUpdateInput } from '../../components/SettingsForm';
import ScenarioRecurringForm from './ScenarioRecurringForm';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: 20,
    height: '100%',
  },
  container_metric: {
    display: 'flex',
    height: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
  },
  title: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  number: {
    fontSize: 30,
    fontWeight: 800,
  },
}));

const Scenario = () => {
  // Standard hooks
  const classes = useStyles();
  const { t, fldt } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  // Fetching data
  const { scenario, teams }: { scenario: ScenarioStore, teams: TeamStore[] } = useHelper((helper: ScenariosHelper) => ({
    scenario: helper.getScenario(scenarioId),
    teams: helper.getScenarioTeams(scenarioId),
  }));

  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
    dispatch(fetchScenarioTeams(scenarioId));
  });

  const permissions = useScenarioPermissions(scenario.scenario_id);

  // Update
  const initialValues = {
    setting_mail_from: scenario.scenario_mail_from,
    setting_mails_reply_to: scenario.scenario_mails_reply_to,
    setting_message_header: scenario.scenario_message_header,
    setting_message_footer: scenario.scenario_message_footer,
  };

  const submitUpdate = (data: SettingUpdateInput) => {
    const scenarioInformationInput: ScenarioInformationInput = {
      scenario_mail_from: data.setting_mail_from || '',
      scenario_mails_reply_to: data.setting_mails_reply_to,
      scenario_message_header: data.setting_message_header,
      scenario_message_footer: scenario.scenario_message_footer,
    };
    dispatch(updateScenarioInformation(scenarioId, scenarioInformationInput));
  };

  // Exercise
  const [open, setOpen] = useState(false);
  const submitCreateExercise = () => {
    dispatch(toExercise(scenario.scenario_id)).then((result: Exercise) => {
      setOpen(false);
      if (result) {
        navigate(`/admin/exercises/${result.exercise_id}`);
      }
    });
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={6} style={{ paddingBottom: 24 }}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container>
              <Grid item xs={6}>
                <Typography variant="h3">{t('Set up a recurring simuation from this scenario')}</Typography>
                <ScenarioRecurringForm />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3">{t('Instantiate a simulation from this scenario')}</Typography>
                <Button
                  variant="contained"
                  startIcon={<CreateOutlined />}
                  color="success"
                  disabled={permissions.readOnly}
                  onClick={() => setOpen(true)}
                >
                  {t('Instantiate')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper variant="outlined" classes={{ root: classes.container_metric }}>
            <div>
              <div className={classes.title}>{t('Injects')}</div>
              <div className={classes.number}>
                {scenario.scenario_injects_statistics?.total_count ?? '-'}
              </div>
            </div>
            <NotificationsOutlined color="primary" sx={{ fontSize: 50 }} />
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper variant="outlined" classes={{ root: classes.container_metric }}>
            <div>
              <div className={classes.title}>{t('Players')}</div>
              <div className={classes.number}>
                {scenario.scenario_users_number ?? '-'}
              </div>
            </div>
            <GroupsOutlined color="primary" sx={{ fontSize: 50 }} />
          </Paper>
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={3}>
        <Grid item xs={6} style={{ paddingBottom: 24 }}>
          <Typography variant="h4">{t('Information')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="h3">{t('Subtitle')}</Typography>
                {scenario.scenario_subtitle || '-'}
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3">{t('Description')}</Typography>
                {scenario.scenario_description || '-'}
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3">{t('Creation date')}</Typography>
                {fldt(scenario.scenario_created_at)}
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3">
                  {t('Sender email address')}
                </Typography>
                {scenario.scenario_mail_from}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={3}>
        <Grid item xs={12} style={{ paddingBottom: 24 }}>
          <Typography variant="h4">{t('Injects distribution')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ScenarioInjectsDistribution teams={teams} />
          </Paper>
        </Grid>
        <Grid item xs={6} style={{ paddingBottom: 24 }}>
          <Typography variant="h4">{t('Settings')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <SettingsForm
              initialValues={initialValues}
              onSubmit={submitUpdate}
              disabled={permissions.readOnly}
            />
          </Paper>
        </Grid>
      </Grid>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Instantiate a simulation from this scenario')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {t('Cancel')}
          </Button>
          <Button
            color="secondary"
            onClick={submitCreateExercise}
          >
            {t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Scenario;
