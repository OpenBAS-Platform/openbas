import React, { useContext, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, Tooltip, Typography } from '@mui/material';
import { PlayArrowOutlined, SettingsOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { fetchInjectResultDto, tryAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import AtomicTestingPopover from './AtomicTestingPopover';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';
import { truncate } from '../../../../utils/String';
import Loader from '../../../../components/Loader';
import { InjectResultDtoContext, InjectResultDtoContextType } from '../InjectResultDtoContext';
import type { InjectResultDTO } from '../../../../utils/api-types';

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
  const classes = useStyles();

  const { injectResultDto, updateInjectResultDto } = useContext<InjectResultDtoContextType>(InjectResultDtoContext);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [openDuplicateId, setOpenDuplicateId] = useState<string | null>(null);
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);

  // Launch atomic testing
  const [open, setOpen] = useState(false);
  const [availableLaunch, setAvailableLaunch] = useState(true);

  const submitLaunch = async () => {
    setOpen(false);
    setAvailableLaunch(false);
    if (injectResultDto?.inject_id) {
      await tryAtomicTesting(injectResultDto.inject_id);
      fetchInjectResultDto(injectResultDto.inject_id).then((result: { data: InjectResultDTO }) => {
        updateInjectResultDto(result.data);
      });
    }
    setAvailableLaunch(true);
  };

  // UPDATE
  const handleOpenEdit = (injectId: string) => {
    setOpenEditId(injectId);
  };

  const handleCloseEdit = () => {
    setOpenEditId(null);
  };

  // DUPLICATE
  const handleOpenDuplicate = (injectId: string) => {
    setOpenDuplicateId(injectId);
  };

  const handleCloseDuplicate = () => {
    setOpenDuplicateId(null);
  };

  // DELETE
  const handleOpenDelete = (injectId: string) => {
    setOpenDeleteId(injectId);
  };

  const handleCloseDelete = () => {
    setOpenDeleteId(null);
  };

  if (!injectResultDto) {
    return <Loader variant="inElement" />;
  }

  return (
    <>
      <Tooltip title={injectResultDto.inject_title}>
        <Typography
          variant="h1"
          gutterBottom={true}
          classes={{ root: classes.title }}
        >
          {truncate(injectResultDto.inject_title, 80)}
        </Typography>
      </Tooltip>
      <div className={classes.actions}>
        {/* eslint-disable-next-line no-nested-ternary */}
        {injectResultDto.inject_injector_contract ? (
          !injectResultDto.inject_ready ? (
            <Button
              style={{ marginRight: 10 }}
              startIcon={<SettingsOutlined />}
              variant="contained"
              color="warning"
              size="small"
              onClick={() => setOpenEditId(injectResultDto.inject_id)}
            >
              {t('Configure')}
            </Button>
          ) : (
            <Button
              style={{ marginRight: 10 }}
              startIcon={<PlayArrowOutlined />}
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setOpen(true)}
              disabled={!availableLaunch}
            >
              {t('Launch')}
            </Button>
          )) : null
        }

        <AtomicTestingPopover
          atomic={injectResultDto}
          openEdit={openEditId === injectResultDto.inject_id}
          openDelete={openDeleteId === injectResultDto.inject_id}
          openDuplicate={openDuplicateId === injectResultDto.inject_id}
          setOpenEdit={handleCloseEdit}
          setOpenDelete={handleCloseDelete}
          setOpenDuplicate={handleCloseDuplicate}
          entries={[
            { label: 'Duplicate', action: () => handleOpenDuplicate(injectResultDto.inject_id) },
            { label: 'Update', action: () => handleOpenEdit(injectResultDto.inject_id) },
            { label: 'Delete', action: () => handleOpenDelete(injectResultDto.inject_id) },
          ]}
        />
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
