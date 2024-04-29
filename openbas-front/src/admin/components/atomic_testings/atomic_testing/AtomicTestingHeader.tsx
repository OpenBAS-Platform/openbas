import { useParams } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, Typography } from '@mui/material';
import { PlayArrowOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { fetchAtomicTesting, fetchAtomicTestingDetail, tryAtomicTesting, updateAtomicTestingTags } from '../../../../actions/atomic_testings/atomic-testing-actions';
import type { AtomicTestingHelper } from '../../../../actions/atomic_testings/atomic-testing-helper';
import AtomicTestingPopover from './AtomicTestingPopover';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';
import { AtomicTestingResultContext } from '../../common/Context';
import StatusChip from './StatusChip';
import type { AtomicTestingDetailOutput, AtomicTestingOutput } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useHelper } from '../../../../store';
import { useAppDispatch } from '../../../../utils/hooks';
import HeaderTags from '../../scenarios/scenario/HeaderTags';

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
    marginRight: 8,
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
  const { atomic, atomicDetail }: { atomic: AtomicTestingOutput, atomicDetail: AtomicTestingDetailOutput, } = useHelper((helper: AtomicTestingHelper) => ({
    atomic: helper.getAtomicTesting(atomicId),
    atomicDetail: helper.getAtomicTestingDetail(atomicId!),
  }));
  useDataLoader(() => {
    dispatch(fetchAtomicTesting(atomicId));
    dispatch(fetchAtomicTestingDetail(atomicId));
  });

  const [tags, setTags] = useState(atomic.atomic_tags);
  const updateTags = (injectId: string, tagIds: string[]) => {
    dispatch(updateAtomicTestingTags(injectId, { atomic_tags: tagIds }))
      .then((result: { entities: { atomics: Record<string, AtomicTestingOutput> }, result: string }) => setTags(result.entities.atomics[result.result].atomic_tags));
  };
  // Launch atomic testing
  const [open, setOpen] = useState(false);
  const [availableLaunch, setAvailableLaunch] = useState(true);

  const submitTry = async () => {
    setOpen(false);
    setAvailableLaunch(false);
    await dispatch(tryAtomicTesting(atomic.atomic_id));
    setAvailableLaunch(true);
    onLaunchAtomicTesting();
  };

  return (
    <div className={classes.container}>
      <div className={classes.containerTitle}>
        <Typography variant="h1" gutterBottom classes={{ root: classes.title }}>
          {atomic.atomic_title}
        </Typography>
        {atomicDetail?.status_label
          && <StatusChip status={atomicDetail?.status_label} />
        }
        <AtomicTestingPopover atomic={atomic} />
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignSelf: 'center' }}>
        <div style={{ alignSelf: 'center' }}>
          <HeaderTags
            tags={tags}
            updateTags={(tagIds: string[]) => updateTags(atomicId, tagIds)}
          />
        </div>

        <Button
          variant="contained"
          startIcon={<PlayArrowOutlined />}
          color="info"
          onClick={() => setOpen(true)}
          sx={{ width: 110, height: 40, marginLeft: 1 }}
          disabled={!atomic.atomic_targets || !(atomic.atomic_targets.length > 0) || !availableLaunch}
        >
          {t('Launch')}
        </Button>
      </div>
    </div>
  );
};

export default AtomicTestingHeader;
