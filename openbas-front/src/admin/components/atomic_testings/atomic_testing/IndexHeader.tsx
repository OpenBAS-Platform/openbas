import { PlayArrowOutlined, SettingsOutlined } from '@mui/icons-material';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { launchAtomicTesting, relaunchAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import Breadcrumbs, { type BreadcrumbsElement } from '../../../../components/Breadcrumbs';
import Transition from '../../../../components/common/Transition';
import { useFormatter } from '../../../../components/i18n';
import type { InjectResultOverviewOutput } from '../../../../utils/api-types';
import ResponsePie from '../../common/injects/ResponsePie';
import AtomicTestingPopover from './AtomicTestingPopover';
import AtomicTestingUpdate from './AtomicTestingUpdate';
import IndexTabs from './IndexTabs';
import IndexTitle from './IndexTitle';

interface Props {
  injectResultOverview: InjectResultOverviewOutput;
  setInjectResultOverview: (injectResultOverviewOutput: InjectResultOverviewOutput) => void;
}

const IndexHeader = ({ injectResultOverview, setInjectResultOverview }: Props) => {
  const { t } = useFormatter();
  const theme = useTheme();
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [canLaunch, setCanLaunch] = useState(true);
  const [edition, setEdition] = useState(false);

  const breadcrumbs: BreadcrumbsElement[] = [
    {
      label: t('Atomic testings'),
      link: '/admin/atomic_testings',
    },
    {
      label: injectResultOverview.inject_title,
      current: true,
    },
  ];

  // Handlers
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleCanLaunch = () => setCanLaunch(true);
  const handleCannotLaunch = () => setCanLaunch(false);
  const handleOpenEdit = () => setEdition(true);
  const handleCloseEdit = () => setEdition(false);

  const submitLaunch = async () => {
    handleCloseDialog();
    handleCannotLaunch();
    if (injectResultOverview?.inject_id) {
      await launchAtomicTesting(injectResultOverview.inject_id).then((result: { data: InjectResultOverviewOutput }) => {
        setInjectResultOverview(result.data);
      });
    }
    handleCanLaunch();
  };
  const submitRelaunch = async () => {
    handleCloseDialog();
    handleCannotLaunch();
    if (injectResultOverview?.inject_id) {
      await relaunchAtomicTesting(injectResultOverview.inject_id).then((result) => {
        navigate(`/admin/atomic_testings/${result.data.inject_id}`);
      });
    }
    handleCanLaunch();
  };

  function getActionButton(injectResultOverviewOutput: InjectResultOverviewOutput) {
    if (!injectResultOverviewOutput.inject_injector_contract) return null;

    if (injectResultOverviewOutput.inject_ready) {
      const launchOrRelaunchKey = !injectResultOverviewOutput.inject_status?.status_id ? 'Launch now' : 'Relaunch now';
      return (
        <Button
          style={{ marginRight: theme.spacing(1.25) }}
          startIcon={<PlayArrowOutlined />}
          variant="contained"
          color="primary"
          size="small"
          onClick={handleOpenDialog}
          disabled={!canLaunch}
        >
          {t(launchOrRelaunchKey)}
        </Button>
      );
    } else {
      return (
        <>
          <Button
            style={{ marginRight: theme.spacing(1.25) }}
            startIcon={<SettingsOutlined />}
            variant="contained"
            color="warning"
            size="small"
            onClick={handleOpenEdit}
          >
            {t('Configure')}
          </Button>
          <AtomicTestingUpdate open={edition} handleClose={handleCloseEdit} atomic={injectResultOverviewOutput} />
        </>
      );
    }
  }

  function getDialog(injectResultOverviewOutput: InjectResultOverviewOutput) {
    return (
      <Dialog open={openDialog} onClose={handleCloseDialog} TransitionComponent={Transition} PaperProps={{ elevation: 1 }}>
        <DialogContent>
          <DialogContentText>
            {injectResultOverviewOutput.inject_ready && !injectResultOverviewOutput.inject_status?.status_id
              ? t('Do you want to launch this atomic testing: {title}?', { title: injectResultOverviewOutput.inject_title })
              : t('Do you want to relaunch this atomic testing: {title}?', { title: injectResultOverviewOutput.inject_title })}
          </DialogContentText>
          {injectResultOverviewOutput.inject_ready && injectResultOverviewOutput.inject_status?.status_id && (
            <Alert severity="warning" style={{ marginTop: 2.5 }}>
              {t('This atomic testing and its previous results will be deleted')}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('Cancel')}</Button>
          <Button
            color="secondary"
            onClick={
              injectResultOverviewOutput.inject_ready && !injectResultOverviewOutput.inject_status?.status_id
                ? submitLaunch
                : submitRelaunch
            }
          >
            {t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      mb={2}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        marginBottom: 4,
      }}
    >
      <Box display="flex" flexDirection="column" justifyContent="left" alignItems="flex-start">
        <Breadcrumbs
          variant="object"
          elements={breadcrumbs}
        />
        <IndexTitle injectResultOverview={injectResultOverview} />
        <IndexTabs injectResultOverview={injectResultOverview} />
      </Box>
      <Box display="flex" flexDirection="row" justifyContent="right" alignItems="flex-start" mb={2}>
        <ResponsePie expectationResultsByTypes={injectResultOverview.inject_expectation_results} />
        <Box display="flex" flexDirection="row" alignItems="center" gap={1} ml={theme.spacing(4)}>
          {getActionButton(injectResultOverview)}
          <AtomicTestingPopover
            atomic={injectResultOverview}
            actions={['Export', 'Update', 'Duplicate', 'Delete']}
            onDelete={() => navigate('/admin/atomic_testings')}
          />
        </Box>
      </Box>
      {getDialog(injectResultOverview)}
    </Box>
  );
};

export default IndexHeader;
