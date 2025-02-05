import { Grid, Paper, Typography } from '@mui/material';
import { Props } from 'html-react-parser/lib/attributes-to-props';
import { FunctionComponent, useContext } from 'react';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../components/i18n';
import ItemStatus from '../../../../components/ItemStatus';
import { InjectResultOverviewOutputContext, InjectResultOverviewOutputContextType } from '../InjectResultOverviewOutputContext';

const useStyles = makeStyles()(() => ({
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

const AtomicTestingDetail: FunctionComponent<Props> = () => {
  const { classes } = useStyles();
  const { t } = useFormatter();

  // Fetching data
  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} style={{ marginBottom: 30 }}>
        <Typography variant="h4">{t('Execution logs')}</Typography>
        {injectResultOverviewOutput ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="subtitle1" className={classes.header} gutterBottom>
              {t('Execution status')}
            </Typography>
            {injectResultOverviewOutput.inject_status?.status_name
            && <ItemStatus isInject={true} status={injectResultOverviewOutput.inject_status?.status_name} label={t(injectResultOverviewOutput.inject_status?.status_name)} />}
            <Typography variant="subtitle1" className={classes.header} style={{ marginTop: 20 }} gutterBottom>
              {t('Traces')}
            </Typography>
            <pre>
              {injectResultOverviewOutput.inject_status?.tracking_sent_date ? (
                <>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Sent Date')}
                    :
                    {injectResultOverviewOutput.inject_status?.tracking_sent_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Ack Date')}
                    :
                    {injectResultOverviewOutput.inject_status?.tracking_ack_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking End Date')}
                    :
                    {injectResultOverviewOutput.inject_status?.tracking_end_date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Execution')}
                    {t('Time')}
                    :
                    {injectResultOverviewOutput.inject_status?.tracking_total_execution_time}
                    {' '}
                    {t('ms')}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Count')}
                    :
                    {injectResultOverviewOutput.inject_status?.tracking_total_count}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Error')}
                    :
                    {injectResultOverviewOutput.inject_status?.tracking_total_error}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {t('Tracking Total Success')}
                    :
                    {injectResultOverviewOutput.inject_status?.tracking_total_success}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" gutterBottom>
                  {t('No data available')}
                </Typography>
              )}
              {(injectResultOverviewOutput.inject_status?.status_traces?.length ?? 0) > 0 && (
                <>
                  <Typography variant="body1" gutterBottom>
                    {t('Traces')}
                    :
                  </Typography>
                  <ul>
                    {injectResultOverviewOutput.inject_status?.status_traces?.map((trace, index) => (
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

export default AtomicTestingDetail;
