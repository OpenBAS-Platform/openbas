import React, { FunctionComponent, useEffect } from 'react';
import { Props } from 'html-react-parser/lib/attributes-to-props';
import { useParams } from 'react-router-dom';
import { Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import type { AtomicTestingDetailOutput } from '../../../../../utils/api-types';
import type { AtomicTestingHelper } from '../../../../../actions/atomictestings/atomic-testing-helper';
import { fetchAtomicTestingDetail } from '../../../../../actions/atomictestings/atomic-testing-actions';

const useStyles = makeStyles(() => ({
  paper: {
    padding: 20,
    marginBottom: 20,
  },
  listItem: {
    marginBottom: 8,
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
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {atomicdetail ? (
          <>
            <Paper elevation={3} className={classes.paper}>
              <Typography variant="title" gutterBottom>
                Status : {atomicdetail.status_label}
              </Typography>
              {atomicdetail.status_traces && (
                <>
                  <Typography variant="body1" sx={{ marginTop: 2 }}>Traces:</Typography>
                  <ul>
                    {atomicdetail.status_traces.map((trace, index) => (
                      <li key={index} className={classes.listItem}>
                        {trace}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Paper>
            <Paper elevation={3} className={classes.paper}>
              <Typography variant="body1" gutterBottom>
                Tracking Sent Date: {atomicdetail.tracking_sent_date || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tracking Ack Date: {atomicdetail.tracking_ack_date || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tracking End Date: {atomicdetail.tracking_end_date || 'N/A'}
              </Typography>
            </Paper>
            <Paper elevation={3} className={classes.paper}>
              <Typography variant="body1" gutterBottom>
                Tracking Total Execution
                Time: {atomicdetail.tracking_total_execution_time || 'N/A'} ms
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tracking Total Count: {atomicdetail.tracking_total_count || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tracking Total Error: {atomicdetail.tracking_total_error || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tracking Total Success: {atomicdetail.tracking_total_success || 'N/A'}
              </Typography>
            </Paper>
          </>
        ) : (
          <Paper elevation={3} className={classes.paper}>
            <Typography variant="body1">No data available</Typography>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

export default Detail;
