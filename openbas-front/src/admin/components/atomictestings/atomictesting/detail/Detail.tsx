import React, { FunctionComponent } from 'react';
import { Props } from 'html-react-parser/lib/attributes-to-props';
import { useParams } from 'react-router-dom';
import { Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import type { AtomicTestingOutput } from '../../../../../utils/api-types';
import type { AtomicTestingHelper } from '../../../../../actions/atomictestings/atomic-testing-helper';
import { fetchAtomicTesting } from '../../../../../actions/atomictestings/atomic-testing-actions';

const useStyles = makeStyles(() => ({
  container: {
    padding: '20px',
  },
}));

const Detail: FunctionComponent<Props> = () => {
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
          <Paper>
            <Typography>
              {atomic.atomic_title}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Detail;
