import { makeStyles } from '@mui/styles';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Paper, Typography } from '@mui/material';
import { useFormatter } from '../../../../../components/i18n';
import { InjectTestStatus } from '../../../../../utils/api-types';
import { fetchInjectTestStatus } from '../../../../../actions/inject_test/inject-test-actions';
import ItemStatus from '../../../../../components/ItemStatus';

const useStyles = makeStyles(() => ({
  paper: {
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
    height: '100%',
  },
  header: {
    fontWeight: 'bold',
  },
  listItem: {
    marginBottom: 8,
  },
}));

const ExerciseTestStatusDetail: FunctionComponent = () => {
  const classes = useStyles();
  const { t } = useFormatter();

  const { statusId } = useParams() as { statusId: InjectTestStatus['status_id'] };

  // Fetching data
  const [exerciseTest, setExerciseTest] = useState<InjectTestStatus | null>();
  useEffect(() => {
    fetchInjectTestStatus(statusId).then((result: { data: InjectTestStatus }) => {
      setExerciseTest(result.data);
    });
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} style={{ marginBottom: 30 }}>
        <Typography variant="h4">{t('Execution logs')}</Typography>
        {exerciseTest ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="subtitle1" className={classes.header} gutterBottom>
              {t('Status')}
            </Typography>
            {exerciseTest.status_name
              && <ItemStatus isInject={true} status={exerciseTest.status_name} label={t(exerciseTest.status_name)} />
            }
            <Typography variant="subtitle1" className={classes.header} style={{ marginTop: 20 }} gutterBottom>
              {t('Traces')}
            </Typography>
            <pre>
              {exerciseTest.tracking_sent_date ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Sent Date')}: {exerciseTest.tracking_sent_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Ack Date')}: {exerciseTest.tracking_ack_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking End Date')}: {exerciseTest.tracking_end_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Execution')}
                    {t('Time')}: {exerciseTest.tracking_total_execution_time} {t('ms')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Count')}: {exerciseTest.tracking_total_count}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Error')}: {exerciseTest.tracking_total_error}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Success')}: {exerciseTest.tracking_total_success}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" gutterBottom>
                  {t('No data available')}
                </Typography>
              )}
              {(exerciseTest.status_traces?.length ?? 0) > 0 && (
                <>
                  <Typography variant="body1" gutterBottom>
                    {t('Traces')}:
                  </Typography>
                  <ul>
                    {exerciseTest.status_traces?.map((trace, index) => (
                      <li key={index} className={classes.listItem}>
                        {`${trace.execution_status} ${trace.execution_message}`}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </pre>
          </Paper>
        ) : (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="body1">{t('No data available')}</Typography>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

export default ExerciseTestStatusDetail;
