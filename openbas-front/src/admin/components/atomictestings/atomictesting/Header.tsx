import { useParams } from 'react-router-dom';
import React from 'react';
import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingOutput } from '../../../../utils/api-types';
import { fetchAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  containerTitle: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  title: {
    textTransform: 'uppercase',
    marginBottom: 0,
  },
}));

const AtomicTestingHeader = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { fldt } = useFormatter();
  const { atomicId } = useParams() as { atomicId: AtomicTestingOutput['atomic_id'] };

  // Fetching data
  const { atomic }: { atomic: AtomicTestingOutput } = useHelper((helper: AtomicTestingHelper) => ({
    atomic: helper.getAtomicTesting(atomicId),
  }));
  useDataLoader(() => {
    dispatch(fetchAtomicTesting(atomicId));
  });

  return (
    <div className={classes.container}>
      <div className={classes.containerTitle}>
        <Typography
          variant="h1"
          gutterBottom
          classes={{ root: classes.title }}
        >
          {atomic.atomic_title}
        </Typography>
      </div>
    </div>
  );
};

export default AtomicTestingHeader;
