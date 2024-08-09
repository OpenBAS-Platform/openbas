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

const ScenarioTestStatusDetail: FunctionComponent = () => {
  const classes = useStyles();
  const { t } = useFormatter();

  const { statusId } = useParams() as { statusId: InjectTestStatus['status_id'] };

  // Fetching data
  const [scenarioTest, setScenarioTest] = useState<InjectTestStatus | null>();
  useEffect(() => {
    fetchInjectTestStatus(statusId).then((result: { data: InjectTestStatus }) => {
      setScenarioTest(result.data);
    });
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} style={{ marginBottom: 30 }}>
        <Typography variant="h4">{t('Execution logs')}</Typography>
        {scenarioTest ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="subtitle1" className={classes.header} gutterBottom>
              {t('Status')}
            </Typography>
            {scenarioTest.status_name
              && <ItemStatus isInject={true} status={scenarioTest.status_name} label={t(scenarioTest.status_name)} />
            }
            <Typography variant="subtitle1" className={classes.header} style={{ marginTop: 20 }} gutterBottom>
              {t('Traces')}
            </Typography>
            <pre>
              {scenarioTest.tracking_sent_date ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Sent Date')}: {scenarioTest.tracking_sent_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Ack Date')}: {scenarioTest.tracking_ack_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking End Date')}: {scenarioTest.tracking_end_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Execution')}
                    {t('Time')}: {scenarioTest.tracking_total_execution_time} {t('ms')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Count')}: {scenarioTest.tracking_total_count}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Error')}: {scenarioTest.tracking_total_error}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Success')}: {scenarioTest.tracking_total_success}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" gutterBottom>
                  {t('No data available')}
                </Typography>
              )}
              {(scenarioTest.status_traces?.length ?? 0) > 0 && (
                <>
                  <Typography variant="body1" gutterBottom>
                    {t('Traces')}:
                  </Typography>
                  <ul>
                    {scenarioTest.status_traces?.map((trace, index) => (
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

export default ScenarioTestStatusDetail;
