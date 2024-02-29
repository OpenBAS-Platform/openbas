import { useNavigate, useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, Grid, LinearProgress, linearProgressClasses, Paper, Theme, Typography } from '@mui/material';
import { makeStyles, styled } from '@mui/styles';
import { GroupsOutlined, NotificationsOutlined, PlayArrowOutlined, ScheduleOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchScenario, fetchScenarioTeams, toExercise, updateScenarioInformation } from '../../../../actions/scenarios/scenario-actions';
import { useFormatter } from '../../../../components/i18n';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import ScenarioSettingsForm from './ScenarioSettingsForm';
import type { TeamStore } from '../../../../actions/teams/Team';
import type { Exercise, ScenarioInformationInput } from '../../../../utils/api-types';
import useScenarioPermissions from '../../../../utils/Scenario';
import Transition from '../../../../components/common/Transition';
import { inlineStyles } from '../../exercises/ExerciseStatus';
import ScenarioInjectsDistribution from '../../injects/ScenarioInjectsDistribution';

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
  chip: {
    fontSize: 20,
    fontWeight: 800,
    textTransform: 'uppercase',
    borderRadius: '0',
  },
  progress: {
    margin: '0 50px',
    flexGrow: 1,
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

const BorderLinearProgress = styled(LinearProgress)(({ theme }: { theme: Theme }) => ({
  height: 5,
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main,
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
        <Grid item xs={6}>
          <Paper
            variant="outlined"
            classes={{ root: classes.container_metric }}
            style={{ display: 'flex' }}
          >
            <div>
              <div className={classes.title}>{t('Status')}</div>
              <Chip
                classes={{ root: classes.chip }}
                style={inlineStyles.grey}
                label={t('None')}
              />
            </div>
            <div className={classes.progress}>
              <BorderLinearProgress
                value={0}
                variant="determinate"
              />
            </div>
            <ScheduleOutlined color="primary" sx={{ fontSize: 50 }} />
          </Paper>
          {/* <Paper variant="outlined" classes={{ root: classes.container_metric }}> */}
          {/*  Scenario status : reccurent, ect */}
          {/*  <div className={classes.progress}> */}
          {/*    <BorderLinearProgress */}
          {/*      value={0} */}
          {/*      variant="determinate" */}
          {/*    /> */}
          {/*  </div> */}
          {/* </Paper> */}
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
            <Typography variant="h3">{t('Instantiate a simulation')}</Typography>
            <Button
              variant="contained"
              startIcon={<PlayArrowOutlined />}
              color="success"
              disabled={permissions.readOnly}
              onClick={() => setOpen(true)}
            >
              {t('Start')}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={3}>
        <Grid item xs={6} style={{ paddingBottom: 24 }}>
          <Typography variant="h4">{t('Injects distribution')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ScenarioInjectsDistribution teams={teams} />
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
