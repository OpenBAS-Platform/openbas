import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { PlayArrowOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingOutput } from '../../../../utils/api-types';
import { fetchAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';
import AtomicPopover from './Popover';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';

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
    marginTop: 5,
    marginBottom: 5,
  },
}));

const AtomicTestingHeader = () => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { atomicId } = useParams() as { atomicId: AtomicTestingOutput['atomic_id'] };

  // Fetching data
  const { atomic }: { atomic: AtomicTestingOutput } = useHelper((helper: AtomicTestingHelper) => ({
    atomic: helper.getAtomicTesting(atomicId),
  }));
  useDataLoader(() => {
    dispatch(fetchAtomicTesting(atomicId));
  });

  // Launch atomic testing
  const [open, setOpen] = useState(false);
  const submitTry = () => {
    setOpen(false);
  };

  return (
    <div className={classes.container}>
      <div className={classes.containerTitle}>
        <Typography variant="h1" gutterBottom classes={{ root: classes.title }}>
          {atomic.atomic_title}
        </Typography>
        <AtomicPopover atomic={atomic}/>
        <Button
          variant="contained"
          startIcon={<PlayArrowOutlined/>}
          color="success"
          onClick={() => setOpen(true)}
        >
          {t('Launch')}
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          TransitionComponent={Transition}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              <p>{t('Do you want to try this inject?')}</p>
              <Alert severity="info">
                {t('The inject will only be sent to you.')}
              </Alert>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              onClick={submitTry}
            >
              {t('Confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default AtomicTestingHeader;
