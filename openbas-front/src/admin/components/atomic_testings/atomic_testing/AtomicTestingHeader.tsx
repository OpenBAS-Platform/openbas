import { useParams } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, Tooltip, Typography } from '@mui/material';
import { PlayArrowOutlined, SettingsOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { fetchAtomicTesting, tryAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import type { AtomicTestingHelper } from '../../../../actions/atomic_testings/atomic-testing-helper';
import AtomicTestingPopover from './AtomicTestingPopover';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';
import { AtomicTestingResultContext } from '../../common/Context';
import type { AtomicTestingOutput } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useHelper } from '../../../../store';
import { useAppDispatch } from '../../../../utils/hooks';
import { truncate } from '../../../../utils/String';

const useStyles = makeStyles(() => ({
  title: {
    float: 'left',
    marginRight: 10,
  },
  actions: {
    margin: '-6px 0 0 0',
    float: 'right',
  },
}));

const AtomicTestingHeader = () => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { atomicId } = useParams() as { atomicId: AtomicTestingOutput['atomic_id'] };
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
  const [openEdit, setOpenEdit] = useState(false);
  const [availableLaunch, setAvailableLaunch] = useState(true);

  const submitLaunch = async () => {
    setOpen(false);
    setAvailableLaunch(false);
    await dispatch(tryAtomicTesting(atomic.atomic_id));
    setAvailableLaunch(true);
    onLaunchAtomicTesting();
  };

  return (
    <>
      <Tooltip title={atomic.atomic_title}>
        <Typography
          variant="h1"
          gutterBottom={true}
          classes={{ root: classes.title }}
        >
          {truncate(atomic.atomic_title, 80)}
        </Typography>
      </Tooltip>
      <div className={classes.actions}>
        {!atomic.atomic_targets || atomic.atomic_targets.length === 0 ? (
          <Button
            style={{ marginRight: 20 }}
            startIcon={<SettingsOutlined />}
            variant="contained"
            color="warning"
            size="small"
            onClick={() => setOpenEdit(true)}
          >
            {t('Configure')}
          </Button>
        ) : (
          <Button
            style={{ marginRight: 20 }}
            startIcon={<PlayArrowOutlined />}
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setOpen(true)}
            disabled={!availableLaunch}
          >
            {t('Launch')}
          </Button>
        )}
        <AtomicTestingPopover atomic={atomic} setOpenEdit={setOpenEdit} openEdit={openEdit}/>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to launch this inject?')}
          </DialogContentText>
          <Alert severity="warning" style={{ marginTop: 20 }}>
            {t('The previous results will be deleted.')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {t('Cancel')}
          </Button>
          <Button
            color="secondary"
            onClick={submitLaunch}
          >
            {t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      <div className="clearfix" />
    </>
  );
};

export default AtomicTestingHeader;
