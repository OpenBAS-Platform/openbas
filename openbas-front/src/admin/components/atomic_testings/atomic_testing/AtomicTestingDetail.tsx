import React, { FunctionComponent, useEffect } from 'react';
import { Props } from 'html-react-parser/lib/attributes-to-props';
import { useParams } from 'react-router-dom';
import { Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import type { AtomicTestingDetailOutput } from '../../../../../utils/api-types';
import type { AtomicTestingHelper } from '../../../../../actions/atomic_testings/atomic-testing-helper';
import { fetchAtomicTestingDetail } from '../../../../../actions/atomic_testings/atomic-testing-actions';

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
      <Grid item xs={12}>
        {atomicDetail ? (
          <>
            <Paper elevation={3} className={classes.paper}>
              <Typography variant="h2" gutterBottom>
                Atomic testing details
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" gutterBottom>
                {atomicDetail?.atomic_description || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              {
                atomicDetail.atomic_tags?.map((tag, index) => {
                  return (
                    <Typography key={index} component="li" variant="body1">
                      {tag.tag_name}
                    </Typography>
                  );
                })
              }
              <Typography variant="subtitle1" gutterBottom>
                Documents
              </Typography>
              {
                atomicDetail.atomic_documents?.map((document, index) => {
                  return (
                    <Typography key={index} component="li" variant="body1">
                      {document.document_name}
                    </Typography>
                  );
                })
              }
              <Typography variant="subtitle1" gutterBottom>
                Expectations
              </Typography>
              {
                atomicDetail.atomic_content.expectations?.map((content, index) => (
                  <Typography key={index} component="li" variant="body1">
                    {content.expectation_name}
                  </Typography>
                ))
              }
            </Paper>
            <Paper elevation={3} className={classes.paper}>
              <Typography variant="h2" gutterBottom>
                Status : {atomicDetail.status_label}
              </Typography>
              {atomicDetail.status_traces && (
                <>
                  <Typography variant="body1" sx={{ marginTop: 2 }}>Traces:</Typography>
                  <ul>
                    {atomicDetail.status_traces.map((trace, index) => (
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
                Tracking Sent Date: {atomicDetail.tracking_sent_date || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tracking Ack Date: {atomicDetail.tracking_ack_date || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tracking End Date: {atomicDetail.tracking_end_date || 'N/A'}
              </Typography>
            </Paper>
            <Paper elevation={3} className={classes.paper}>
              <Typography variant="body1" gutterBottom>
                Tracking Total Execution
                Time: {atomicDetail.tracking_total_execution_time || 'N/A'} ms
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tracking Total Count: {atomicDetail.tracking_total_count || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tracking Total Error: {atomicDetail.tracking_total_error || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tracking Total Success: {atomicDetail.tracking_total_success || 'N/A'}
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
