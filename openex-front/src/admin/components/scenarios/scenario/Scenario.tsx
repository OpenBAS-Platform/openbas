import { useParams } from 'react-router-dom';
import React from 'react';
import { Grid, Paper, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { GroupsOutlined, NotificationsOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchScenario, fetchScenarioTeams, updateScenarioInformation } from '../../../../actions/scenarios/scenario-actions';
import { useFormatter } from '../../../../components/i18n';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import ScenarioSettingsForm from './ScenarioSettingsForm';
import InjectsDistribution from '../../injects/InjectsDistribution';
import type { TeamStore } from '../../teams/teams/Team';
import type { ScenarioInformationInput } from '../../../../utils/api-types';

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

  const initialValues = (({
    scenario_mail_from,
    scenario_message_header,
    scenario_message_footer,
  }) => ({
    scenario_mail_from,
    scenario_message_header,
    scenario_message_footer,
  }))(scenario);

  const submitUpdate = (data: ScenarioInformationInput) => dispatch(updateScenarioInformation(scenarioId, data));

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Paper variant="outlined" classes={{ root: classes.container_metric }}>
            Scenario status : reccurent, ect
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
        <Grid item xs={6} style={{ paddingBottom: 24 }}>
          <Typography variant="h4">{t('Execution')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            Create simulation section
          </Paper>
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={3}>
        <Grid item xs={6} style={{ paddingBottom: 24 }}>
          <Typography variant="h4">{t('Injects distribution')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <InjectsDistribution teams={teams} />
          </Paper>
        </Grid>
        <Grid item xs={6} style={{ paddingBottom: 24 }}>
          <Typography variant="h4">{t('Settings')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ScenarioSettingsForm
              initialValues={initialValues}
              onSubmit={submitUpdate}
              scenarioId={scenarioId}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Scenario;
