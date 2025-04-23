import { PlayArrowOutlined, SettingsOutlined } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, Divider, GridLegacy, Paper, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router';
import { interval } from 'rxjs';
import { makeStyles } from 'tss-react/mui';

import { fetchInjectResultOverviewOutput, launchAtomicTesting, relaunchAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import Transition from '../../../../components/common/Transition';
import { errorWrapper } from '../../../../components/Error';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import NotFound from '../../../../components/NotFound';
import { type InjectResultOverviewOutput } from '../../../../utils/api-types';
import { FIVE_SECONDS } from '../../../../utils/Time';
import { TeamContext } from '../../common/Context';
import ResponsePie from '../../common/injects/ResponsePie';
import { InjectResultOverviewOutputContext } from '../InjectResultOverviewOutputContext';
import AtomicTestingHeader from './AtomicTestingHeader';
import AtomicTestingPopover from './AtomicTestingPopover';
import AtomicTestingUpdate from './AtomicTestingUpdate';
import teamContextForAtomicTesting from './context/TeamContextForAtomicTesting';
import AtomicTestingPayloadInfo from './payload_info/AtomicTestingPayloadInfo';

const interval$ = interval(FIVE_SECONDS);

const useStyles = makeStyles()(() => ({
  item: {
    height: 30,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const AtomicTesting = lazy(() => import('./AtomicTesting'));
const AtomicTestingDetail = lazy(() => import('./AtomicTestingDetail'));
const AtomicTestingFindings = lazy(() => import('./AtomicTestingFindings'));

const Index = () => {
  const { classes } = useStyles();
  const { t } = useFormatter();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };

  // States
  const [pristine, setPristine] = useState(true);
  const [loading, setLoading] = useState(true);
  const [injectResultOverviewOutput, setInjectResultOverviewOutput] = useState<InjectResultOverviewOutput>();
  const [openDialog, setOpenDialog] = useState(false);
  const [canLaunch, setCanLaunch] = useState(true);
  const [edition, setEdition] = useState(false);

  // Update data
  const updateInjectResultOverviewOutput = () => {
    fetchInjectResultOverviewOutput(injectId).then((result: { data: InjectResultOverviewOutput }) => {
      setInjectResultOverviewOutput(result.data);
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchInjectResultOverviewOutput(injectId)
      .then((result: { data: InjectResultOverviewOutput }) => {
        setInjectResultOverviewOutput(result.data);
      })
      .finally(() => {
        setLoading(false);
        setPristine(false);
      });
  }, [injectId]);

  useEffect(() => {
    const subscription = interval$.subscribe(() => {
      setLoading(true);
      fetchInjectResultOverviewOutput(injectId)
        .then((result: { data: InjectResultOverviewOutput }) => {
          if (result.data.inject_updated_at !== injectResultOverviewOutput?.inject_updated_at) {
            setInjectResultOverviewOutput(result.data);
          }
        })
        .catch(() => {
          subscription.unsubscribe();
        })
        .finally(() => {
          setLoading(false);
          setPristine(false);
        });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [injectResultOverviewOutput]);

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
    if (injectResultOverviewOutput?.inject_id) {
      await launchAtomicTesting(injectResultOverviewOutput.inject_id).then((result: { data: InjectResultOverviewOutput }) => {
        setInjectResultOverviewOutput(result.data);
      });
    }
    handleCanLaunch();
  };

  const submitRelaunch = async () => {
    handleCloseDialog();
    handleCannotLaunch();
    if (injectResultOverviewOutput?.inject_id) {
      await relaunchAtomicTesting(injectResultOverviewOutput.inject_id).then((result) => {
        navigate(`/admin/atomic_testings/${result.data.inject_id}`);
      });
    }
    handleCanLaunch();
  };

  // Early returns
  if (pristine && loading) return <Loader />;

  if (!injectResultOverviewOutput) {
    return (
      <Alert severity="warning">
        <AlertTitle>{t('Warning')}</AlertTitle>
        {t('Atomic testing is currently unavailable or you do not have sufficient permissions to access it.')}
      </Alert>
    );
  }

  // Path correction
  let tabValue = location.pathname;
  if (location.pathname.includes(`/admin/atomic_testings/${injectResultOverviewOutput.inject_id}/detail`)) {
    tabValue = `/admin/atomic_testings/${injectResultOverviewOutput.inject_id}/detail`;
  }

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
    <TeamContext.Provider value={teamContextForAtomicTesting()}>
      <InjectResultOverviewOutputContext.Provider
        value={{
          injectResultOverviewOutput,
          updateInjectResultOverviewOutput,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          mb={2}
        >
          {/* LEFT: Breadcrumbs, Title, Tabs */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              marginBottom: 4,
              paddingBottom: 0,
            }}>
            <Breadcrumbs
              variant="object"
              elements={[
                {
                  label: t('Atomic testings'),
                  link: '/admin/atomic_testings',
                },
                {
                  label: injectResultOverviewOutput.inject_title,
                  current: true,
                },
              ]}
            />
            <AtomicTestingHeader />
            <Box
              sx={{ marginTop: 1 }}
            >
              <Tabs value={tabValue} >
                <Tab
                  component={Link}
                  to={`/admin/atomic_testings/${injectResultOverviewOutput.inject_id}`}
                  value={`/admin/atomic_testings/${injectResultOverviewOutput.inject_id}`}
                  label={t('Overview')}
                  className={classes.item}
                />
                {(injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload
                  || injectResultOverviewOutput.inject_type === 'openbas_nmap') && (
                  <Tab
                    component={Link}
                    to={`/admin/atomic_testings/${injectResultOverviewOutput.inject_id}/findings`}
                    value={`/admin/atomic_testings/${injectResultOverviewOutput.inject_id}/findings`}
                    label={t('Findings')}
                    className={classes.item}
                  />
                )}
                <Tab
                  component={Link}
                  to={`/admin/atomic_testings/${injectResultOverviewOutput.inject_id}/detail`}
                  value={`/admin/atomic_testings/${injectResultOverviewOutput.inject_id}/detail`}
                  label={t('Execution details')}
                  className={classes.item}
                />
                {injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload && (
                  <Tab
                    component={Link}
                    to={`/admin/atomic_testings/${injectResultOverviewOutput.inject_id}/payload_info`}
                    value={`/admin/atomic_testings/${injectResultOverviewOutput.inject_id}/payload_info`}
                    label={t('Payload info')}
                    className={classes.item}
                  />
                )}
              </Tabs>
            </Box>
          </Box>

          <Box display="flex" flexDirection="row" justifyContent="right" alignItems="flex-start" mb={2}
               sx={{
                 borderBottom: 1,
                 borderColor: 'divider',
                 marginBottom: 4,
                 paddingBottom: 0,
               }}>
            <ResponsePie expectationResultsByTypes={injectResultOverviewOutput.inject_expectation_results} />
            <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
              {getActionButton(injectResultOverviewOutput)}
              <AtomicTestingPopover
                atomic={injectResultOverviewOutput}
                actions={['Export', 'Update', 'Duplicate', 'Delete']}
                onDelete={() => navigate('/admin/atomic_testings')}
              />
            </Box>
          </Box>

          {/* Dialog */}
          {getDialog(injectResultOverviewOutput)}
        </Box>
        {/* CONTENT ROUTES */}
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="" element={errorWrapper(AtomicTesting)()} />
            {(injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload
              || injectResultOverviewOutput.inject_type === 'openbas_nmap') && (
              <Route path="findings" element={errorWrapper(AtomicTestingFindings)()} />
            )}
            <Route path="detail" element={errorWrapper(AtomicTestingDetail)()} />
            {injectResultOverviewOutput.inject_injector_contract?.injector_contract_payload && (
              <Route path="payload_info" element={errorWrapper(AtomicTestingPayloadInfo)()} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </InjectResultOverviewOutputContext.Provider>
    </TeamContext.Provider>
  );
};

export default Index;
