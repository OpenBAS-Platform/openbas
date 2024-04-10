import React, { FunctionComponent, useEffect } from 'react';
import { Props } from 'html-react-parser/lib/attributes-to-props';
import { useParams } from 'react-router-dom';
import { Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import type { AtomicTestingDetailOutput } from '../../../../../utils/api-types';
import type { AtomicTestingHelper } from '../../../../../actions/atomictestings/atomic-testing-helper';
import { fetchAtomicTestingDetail } from '../../../../../actions/atomictestings/atomic-testing-actions';

const useStyles = makeStyles(() => ({
  container: {
    padding: '20px',
  },
}));

const Detail: FunctionComponent<Props> = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { atomicId } = useParams() as { atomicId: AtomicTestingDetailOutput['atomic_id'] };

  // Fetching data
  const { atomicdetail }: {
    atomicdetail: AtomicTestingDetailOutput,
  } = useHelper((helper: AtomicTestingHelper) => ({
    atomicdetail: helper.getAtomicTestingDetail(atomicId),
  }));

  useEffect(() => {
    dispatch(fetchAtomicTestingDetail(atomicId));
  }, [dispatch, atomicId]);

  return (
    <Grid container spacing={2} classes={{ root: classes.container }}>
      <Grid item xs={12}>
        <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
          {atomicdetail ? (
            <>
              <Typography variant="h5">{atomicdetail.status_label}</Typography>
              {atomicdetail.status_traces && (
              <div>
                <Typography variant="subtitle1">Status Traces:</Typography>
                <ul>
                  {atomicdetail.status_traces.map((trace, index) => (
                    <li key={index}>{trace}</li>
                  ))}
                </ul>
              </div>
              )}
              <Typography variant="body1">
                Tracking Sent Date: {atomicdetail.tracking_sent_date || 'N/A'}
              </Typography>
              <Typography variant="body1">
                Tracking Ack Date: {atomicdetail.tracking_ack_date || 'N/A'}
              </Typography>
              <Typography variant="body1">
                Tracking End Date: {atomicdetail.tracking_end_date || 'N/A'}
              </Typography>
              <Typography variant="body1">
                Tracking Total Execution Time: {atomicdetail.tracking_total_execution_time || 'N/A'} ms
              </Typography>
              <Typography variant="body1">
                Tracking Total Count: {atomicdetail.tracking_total_count || 'N/A'}
              </Typography>
              <Typography variant="body1">
                Tracking Total Error: {atomicdetail.tracking_total_error || 'N/A'}
              </Typography>
              <Typography variant="body1">
                Tracking Total Success: {atomicdetail.tracking_total_success || 'N/A'}
              </Typography>
            </>
          ) : (
            <Typography variant="body1">No data available</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Detail;
