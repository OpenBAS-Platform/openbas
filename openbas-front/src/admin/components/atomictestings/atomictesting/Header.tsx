import { useParams } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { PlayArrowOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingOutput, InjectStatus, InjectStatusExecution } from '../../../../utils/api-types';
import { fetchAtomicTesting, tryAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';
import AtomicPopover from './Popover';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';
import { AtomicTestingResultContext } from '../../components/Context';
import StatusChip from '../../components/atomictestings/StatusChip';

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
  const [injectResult, setInjectResult] = useState<InjectStatus | null>(null);
  const [openResult, setOpenResult] = useState(false);
  const { onLaunchAtomicTesting } = useContext(AtomicTestingResultContext);

  // Fetching data
  const { atomic }: { atomic: AtomicTestingOutput } = useHelper((helper: AtomicTestingHelper) => ({
    atomic: helper.getAtomicTesting(atomicId),
  }));
  useDataLoader(() => {
    dispatch(fetchAtomicTesting(atomicId));
  });

  // Launch atomic testing
  const [open, setOpen] = useState(false);
  const [availableLaunch, setAvailableLaunch] = useState(true);

  const submitTry = () => {
    setOpen(false);
    setAvailableLaunch(false);
    dispatch(tryAtomicTesting(atomic.atomic_id)).then((payload: InjectStatus) => {
      setInjectResult(payload);
      setOpenResult(true);
    });
  };

  const handleCloseResult = () => {
    setOpenResult(false);
    setInjectResult(null);
    setAvailableLaunch(true);
    onLaunchAtomicTesting();
  };

  return (
    <div className={classes.container}>
      <div className={classes.containerTitle}>
        <Typography variant="h1" gutterBottom classes={{ root: classes.title }}>
          {atomic.atomic_title}
        </Typography>
        <AtomicPopover atomic={atomic} />
        <StatusChip status={atomic.atomic_status}/>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          TransitionComponent={Transition}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              <span>{t('Do you want to try this inject?')}</span>
            </DialogContentText>
            <Alert severity="info" style={{ marginTop: 20 }}>
              {t('The previous results will be deleted.')}
            </Alert>
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
      <Button
        variant="contained"
        startIcon={<PlayArrowOutlined />}
        color="info"
        onClick={() => setOpen(true)}
        sx={{ width: 120, height: 40 }}
        disabled={!atomic.atomic_targets || !(atomic.atomic_targets.length > 0) || !availableLaunch}
      >
        {t('Launch')}
      </Button>
    </div>
  );
};

export default AtomicTestingHeader;
