import { useContext, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, Tooltip, Typography } from '@mui/material';
import { PlayArrowOutlined, SettingsOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { fetchInjectResultDto, tryAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import AtomicTestingPopover from './AtomicTestingPopover';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';
import { truncate } from '../../../../utils/String';
import Loader from '../../../../components/Loader';
import { InjectResultDtoContext, InjectResultDtoContextType } from '../InjectResultDtoContext';
import type { InjectResultDTO } from '../../../../utils/api-types';
import AtomicTestingUpdate from './AtomicTestingUpdate';

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
  const navigate = useNavigate();

  const { injectResultDto, updateInjectResultDto } = useContext<InjectResultDtoContextType>(InjectResultDtoContext);

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

  if (!injectResultDto) {
    return <Loader variant="inElement" />;
  }

  // Edition
  const [edition, setEdition] = useState(false);
  const handleOpenEdit = () => setEdition(true);
  const handleCloseEdit = () => setEdition(false);

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
            <>
              <Button
                style={{ marginRight: 10 }}
                startIcon={<SettingsOutlined />}
                variant="contained"
                color="warning"
                size="small"
                onClick={handleOpenEdit}
              >
                {t('Configure')}
              </Button>
              <AtomicTestingUpdate
                open={edition}
                handleClose={handleCloseEdit}
                atomic={injectResultDto}
              />
            </>
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
          actions={['Update', 'Duplicate', 'Delete']}
          onDelete={() => navigate('/admin/atomic_testings')}
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
