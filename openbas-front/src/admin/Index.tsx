import { lazy, Suspense } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { makeStyles, useTheme } from '@mui/styles';
import { Box } from '@mui/material';
import TopBar from './components/nav/TopBar';
import LeftBar from './components/nav/LeftBar';
import { errorWrapper } from '../components/Error';
import useDataLoader from '../utils/hooks/useDataLoader';
import { useHelper } from '../store';
import type { Theme } from '../components/Theme';
import type { LoggedHelper } from '../actions/helper';
import Loader from '../components/Loader';
import NotFound from '../components/NotFound';
import InjectIndex from './components/simulations/simulation/injects/InjectIndex';
import SystemBanners, { computeBannerSettings } from '../public/components/systembanners/SystemBanners';
import { fetchTags } from '../actions/Tag';
import { useAppDispatch } from '../utils/hooks';

const Dashboard = lazy(() => import('./components/Dashboard'));
const IndexProfile = lazy(() => import('./components/profile/Index'));
const FullTextSearch = lazy(() => import('./components/search/FullTextSearch'));
const Exercises = lazy(() => import('./components/simulations/Exercises'));
const IndexExercise = lazy(() => import('./components/simulations/simulation/Index'));
const AtomicTestings = lazy(() => import('./components/atomic_testings/AtomicTestings'));
const IndexAtomicTesting = lazy(() => import('./components/atomic_testings/atomic_testing/Index'));
const Scenarios = lazy(() => import('./components/scenarios/Scenarios'));
const IndexScenario = lazy(() => import('./components/scenarios/scenario/Index'));
const Assets = lazy(() => import('./components/assets/Index'));
const Teams = lazy(() => import('./components/teams/Index'));
const IndexComponents = lazy(() => import('./components/components/Index'));
const IndexIntegrations = lazy(() => import('./components/integrations/Index'));
const IndexAgents = lazy(() => import('./components/agents/Agents'));
const Payloads = lazy(() => import('./components/payloads/Payloads'));
const Mitigations = lazy(() => import('./components/mitigations/Mitigations'));
const IndexSettings = lazy(() => import('./components/settings/Index'));

const useStyles = makeStyles<Theme>((theme) => ({
  toolbar: theme.mixins.toolbar,
}));

const Index = () => {
  const theme = useTheme<Theme>();
  const classes = useStyles();
  const navigate = useNavigate();
  const { logged, settings } = useHelper((helper: LoggedHelper) => {
    return { logged: helper.logged(), settings: helper.getPlatformSettings() };
  });
  if (logged.isOnlyPlayer) {
    navigate('/private');
  }
  const boxSx = {
    flexGrow: 1,
    padding: 3,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    overflowY: 'hidden',
  };
  const dispatch = useAppDispatch();
  useDataLoader(() => {
    dispatch(fetchTags());
  });
  const { bannerHeight } = computeBannerSettings(settings);
  return (
    <>
      <SystemBanners settings={settings} />
      <Box
        sx={{
          display: 'flex',
          minWidth: 1400,
          marginTop: bannerHeight,
          marginBottom: bannerHeight,
        }}
      >
        <TopBar />
        <LeftBar />
        <Box component="main" sx={boxSx}>
          <div className={classes.toolbar} />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="profile/*" element={errorWrapper(IndexProfile)()} />
              <Route path="" element={errorWrapper(Dashboard)()} />
              <Route path="fulltextsearch" element={errorWrapper(FullTextSearch)()} />
              <Route path="exercises" element={errorWrapper(Exercises)()} />
              <Route path="exercises/:exerciseId/*" element={errorWrapper(IndexExercise)()} />
              <Route path="exercises/:exerciseId/injects/:injectId/*" element={errorWrapper(InjectIndex)()} />
              <Route path="atomic_testings" element={errorWrapper(AtomicTestings)()} />
              <Route path="atomic_testings/:injectId/*" element={errorWrapper(IndexAtomicTesting)()} />
              <Route path="scenarios" element={errorWrapper(Scenarios)()} />
              <Route path="scenarios/:scenarioId/*" element={errorWrapper(IndexScenario)()} />
              <Route path="assets/*" element={errorWrapper(Assets)()} />
              <Route path="teams/*" element={errorWrapper(Teams)()} />
              <Route path="components/*" element={errorWrapper(IndexComponents)()} />
              <Route path="payloads" element={errorWrapper(Payloads)()} />
              <Route path="mitigations" element={errorWrapper(Mitigations)()} />
              <Route path="integrations/*" element={errorWrapper(IndexIntegrations)()} />
              <Route path="agents/*" element={errorWrapper(IndexAgents)()} />
              <Route path="settings/*" element={errorWrapper(IndexSettings)()} />
              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </>
  );
};

export default Index;
