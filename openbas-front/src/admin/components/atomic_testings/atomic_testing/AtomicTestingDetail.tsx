import React, { FunctionComponent, useEffect } from 'react';
import { Props } from 'html-react-parser/lib/attributes-to-props';
import { useParams } from 'react-router-dom';
import { Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { AtomicTestingDetailOutput } from '../../../../utils/api-types';
import type { AtomicTestingHelper } from '../../../../actions/atomic_testings/atomic-testing-helper';
import { fetchAtomicTestingDetail } from '../../../../actions/atomic_testings/atomic-testing-actions';
import StatusChip from './StatusChip';

const useStyles = makeStyles(() => ({
  paper: {
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
    height: '100%',
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  header: {
    fontWeight: 'bold',
  },
  listItem: {
    marginBottom: 8,
  },
}));

const Detail: FunctionComponent<Props> = () => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { atomicId } = useParams() as { atomicId: AtomicTestingDetailOutput['atomic_id'] };

  // Fetching data
  const { atomicDetail }: {
    atomicDetail: AtomicTestingDetailOutput,
  } = useHelper((helper: AtomicTestingHelper) => ({
    atomicDetail: helper.getAtomicTestingDetail(atomicId!),
  }));

  useEffect(() => {
    dispatch(fetchAtomicTestingDetail(atomicId));
  }, [dispatch, atomicId]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} style={{ marginBottom: 30 }}>
        <Typography variant="h4">Configuration</Typography>
        {atomicDetail ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <div className={classes.flexContainer}>
              <div>
                <Typography variant="subtitle1" className={classes.header} gutterBottom>
                  {t('Description')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {atomicDetail?.atomic_description || '-'}
                </Typography>
              </div>
              <div>
                <Typography variant="subtitle1" className={classes.header} gutterBottom>
                  {t('Expectations')}
                </Typography>
                {
                  atomicDetail.atomic_expectations !== undefined && atomicDetail.atomic_expectations.length > 0
                    ? atomicDetail.atomic_expectations.map((expectation, index) => (
                      <Typography key={index} variant="body1">
                        {expectation.expectation_name}
                      </Typography>
                    )) : <Typography variant="body1" gutterBottom>
                      {'-'}
                    </Typography>
                }
              </div>
              <div style={{ marginRight: 50 }}>
                <Typography variant="subtitle1" className={classes.header} gutterBottom>
                  {t('Documents')}
                </Typography>
                {
                  atomicDetail.atomic_documents !== undefined && atomicDetail.atomic_documents.length > 0
                    ? atomicDetail.atomic_documents.map((document, index) => {
                      return (
                        <Typography key={index} variant="body1">
                          {document.document_name}
                        </Typography>
                      );
                    }) : <Typography variant="body1" gutterBottom>
                      {'-'}
                    </Typography>
                }
              </div>
            </div>
          </Paper>
        ) : (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="body1">{t('No data available')}</Typography>
          </Paper>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h4">Execution logs</Typography>
        {atomicDetail ? (
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Typography variant="subtitle1" className={classes.header} gutterBottom>
              {t('Status')}
            </Typography>
            {atomicDetail.status_label
              && <StatusChip status={atomicDetail.status_label} />
            }
            <Typography variant="subtitle1" className={classes.header} style={{ marginTop: 20 }} gutterBottom>
              {t('Traces')}
            </Typography>
            <pre>
              {atomicDetail.status_traces && (
                <ul>
                  {atomicDetail.status_traces.map((trace, index) => (
                    <li key={index} className={classes.listItem}>
                      {trace}
                    </li>
                  ))}
                </ul>
              )}
              <Typography variant="body1" gutterBottom>
                {t('Tracking Sent Date')}: {atomicDetail.tracking_sent_date || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t('Tracking Ack Date')}: {atomicDetail.tracking_ack_date || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t('Tracking End Date')}: {atomicDetail.tracking_end_date || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t('Tracking Total Execution')}
                {t('Time')}: {atomicDetail.tracking_total_execution_time || 'N/A'} ms
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t('Tracking Total Count')}: {atomicDetail.tracking_total_count || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t('Tracking Total Error')}: {atomicDetail.tracking_total_error || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t('Tracking Total Success')}: {atomicDetail.tracking_total_success || 'N/A'}
              </Typography>
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

export default Detail;
