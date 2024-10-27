import { makeStyles } from '@mui/styles';
import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, Grid, Paper, Typography } from '@mui/material';
import { useFormatter } from '../../../components/i18n';
import type { InjectTestStatus } from '../../../utils/api-types';
import ItemStatus from '../../../components/ItemStatus';
import Drawer from '../../../components/common/Drawer';
import { isNotEmptyField } from '../../../utils/utils';
import InjectIcon from '../common/injects/InjectIcon';
import type { Theme } from '../../../components/Theme';
import { truncate } from '../../../utils/String';

const useStyles = makeStyles((theme: Theme) => ({
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
  injectorContract: {
    margin: '20px 0 20px 15px',
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
  },
  injectorContractHeader: {
    backgroundColor: theme.palette.background.default,
  },
  injectorContractContent: {
    fontSize: 18,
    textAlign: 'center',
  },
}));

interface Props {
  open: boolean;
  handleClose: () => void;
  test: InjectTestStatus | undefined;
}

const InjectTestDetail: FunctionComponent<Props> = ({
  open,
  handleClose,
  test,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  return (
    <Drawer
      open={open}
      handleClose={handleClose}
      title={t('Test Details')}
    >

      <Grid container spacing={2}>
        <Card elevation={0} classes={{ root: classes.injectorContract }}>
          {test
            ? (
              <CardHeader
                classes={{ root: classes.injectorContractHeader }}
                avatar={<InjectIcon
                  isPayload={isNotEmptyField(test.injector_contract?.injector_contract_payload)}
                  type={
                    test.injector_contract?.injector_contract_payload
                      ? test.injector_contract?.injector_contract_payload.payload_collector_type
                      || test.injector_contract?.injector_contract_payload.payload_type
                      : test.inject_type
                  }
                  variant="list"
                        />}

              />
            ) : (
              <Paper variant="outlined" classes={{ root: classes.paper }}>
                <Typography variant="body1">{t('No data available')}</Typography>
              </Paper>
            )}
          <CardContent classes={{ root: classes.injectorContractContent }}>
            {truncate(test?.inject_title, 80)}
          </CardContent>
        </Card>
        <Grid item xs={12}>
          <Typography variant="h4">{t('Execution logs')}</Typography>
          {test ? (
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              <Typography variant="subtitle1" className={classes.header} gutterBottom>
                {t('Status')}
              </Typography>
              {test.status_name
                && <ItemStatus isInject={true} status={test.status_name} label={t(test.status_name)} />
              }
              <Typography variant="subtitle1" className={classes.header} style={{ marginTop: 20 }} gutterBottom>
                {t('Traces')}
              </Typography>
              <pre>
                {test.tracking_sent_date ? (
                  <>
                    <Typography variant="body1" gutterBottom>
                      {t('Tracking Sent Date')}: {test.tracking_sent_date}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {t('Tracking Ack Date')}: {test.tracking_ack_date}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {t('Tracking End Date')}: {test.tracking_end_date}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {t('Tracking Total Execution')}
                      {t('Time')}: {test.tracking_total_execution_time} {t('ms')}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {t('Tracking Total Count')}: {test.tracking_total_count}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {t('Tracking Total Error')}: {test.tracking_total_error}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {t('Tracking Total Success')}: {test.tracking_total_success}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1" gutterBottom>
                    {t('No data available')}
                  </Typography>
                )}
                {(test.status_traces?.length ?? 0) > 0 && (
                  <>
                    <Typography variant="body1" gutterBottom>
                      {t('Traces')}:
                    </Typography>
                    <ul>
                      {test.status_traces?.map((trace, index) => (
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
    </Drawer>

  );
};

export default InjectTestDetail;
