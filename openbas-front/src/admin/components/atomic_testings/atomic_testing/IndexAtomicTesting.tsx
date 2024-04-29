import React, { FunctionComponent, lazy, Suspense } from 'react';
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Loader from '../../../../components/Loader';
import { errorWrapper } from '../../../../components/Error';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import NotFound from '../../../../components/NotFound';
import { useFormatter } from '../../../../components/i18n';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import AtomicTestingHeader from './AtomicTestingHeader';
import { fetchAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import type { AtomicTestingOutput } from '../../../../utils/api-types';
import type { AtomicTestingHelper } from '../../../../actions/atomic_testings/atomic-testing-helper';
import { AtomicTestingResultContext, AtomicTestingResultContextType } from '../../common/Context';

const useStyles = makeStyles(() => ({
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

const IndexAtomicTestingComponent: FunctionComponent<{ atomic: AtomicTestingOutput }> = ({
  atomic,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const location = useLocation();
  let tabValue = location.pathname;
  if (location.pathname.includes(`/admin/atomic_testings/${atomic.atomic_id}/detail`)) {
    tabValue = `/admin/atomic_testings/${atomic.atomic_id}/detail`;
  }
  return (
    <div>

      <Breadcrumbs variant="object" elements={[
        { label: t('Atomic testings') },
        { label: atomic.atomic_title, current: true },
      ]}
      />
      <AtomicTestingHeader />
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          marginBottom: 4,
        }}
      >
        <Tabs value={tabValue}>
          <Tab
            component={Link}
            to={`/admin/atomic_testings/${atomic.atomic_id}`}
            value={`/admin/atomic_testings/${atomic.atomic_id}`}
            label={t('Targets response')}
            className={classes.item}
          />
          <Tab
            component={Link}
            to={`/admin/atomic_testings/${atomic.atomic_id}/detail`}
            value={`/admin/atomic_testings/${atomic.atomic_id}/detail`}
            label={t('Inject details')}
            className={classes.item}
          />
        </Tabs>
      </Box>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="" element={errorWrapper(AtomicTesting)()} />
          <Route path="detail" element={errorWrapper(AtomicTestingDetail)()} />
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
};

const IndexAtomicTesting = () => {
  // Standard hooks
  const dispatch = useAppDispatch();

  // Fetching data
  const { atomicId } = useParams() as { atomicId: AtomicTestingOutput['atomic_id'] };
  const atomic = useHelper((helper: AtomicTestingHelper) => helper.getAtomicTesting(atomicId));
  useDataLoader(() => {
    dispatch(fetchAtomicTesting(atomicId));
  });

  // Context
  const context: AtomicTestingResultContextType = {
    onLaunchAtomicTesting(): void {
      dispatch(fetchAtomicTesting(atomicId));
    },
  };

  if (atomic) {
    return (
      <AtomicTestingResultContext.Provider value={context}>
        <IndexAtomicTestingComponent atomic={atomic} />
      </AtomicTestingResultContext.Provider>
    );
  }
  return <Loader />;
};

export default IndexAtomicTesting;
