import { useParams } from 'react-router-dom';
import React from 'react';
import { Grid, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingOutput } from '../../../../utils/api-types';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';
import { fetchAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import ResponsePie from '../../components/atomictestings/ResponsePie';

const useStyles = makeStyles(() => ({
  paper: {
    padding: 50,
    height: '100%',
  },
  container: {
    marginBottom: '20px',
  },
}));

const AtomicTesting = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { atomicId } = useParams() as { atomicId: AtomicTestingOutput['atomic_id'] };

  // Fetching data
  const { atomic }: {
    atomic: AtomicTestingOutput,
  } = useHelper((helper: AtomicTestingHelper) => ({
    atomic: helper.getAtomicTesting(atomicId),
  }));

  useDataLoader(() => {
    dispatch(fetchAtomicTesting(atomicId));
  });

  return (
    <>
      <Grid container spacing={2} classes={{ root: classes.container }}>
        <Grid item xs={12}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ResponsePie expectations={atomic.atomic_expectation_results}/>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={2} classes={{ root: classes.container }}>
        <Grid item xs={4} style={{ paddingBottom: 24 }}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
          </Paper>
        </Grid>
        <Grid item xs={8} style={{ paddingBottom: 24 }}>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default AtomicTesting;
