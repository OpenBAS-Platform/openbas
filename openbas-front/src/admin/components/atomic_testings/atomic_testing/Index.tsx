import React, { FunctionComponent, lazy, Suspense, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Loader from '../../../../components/Loader';
import { errorWrapper } from '../../../../components/Error';
import { useAppDispatch } from '../../../../utils/hooks';
import NotFound from '../../../../components/NotFound';
import { useFormatter } from '../../../../components/i18n';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import AtomicTestingHeader from './AtomicTestingHeader';
import { fetchAtomicTesting, fetchAtomicTestingDetail, fetchInjectResultDto } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { AtomicTestingResultContext, AtomicTestingResultContextType } from '../../common/Context';
import type { InjectResultDTO } from '../../../../utils/api-types';

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

const IndexAtomicTestingComponent: FunctionComponent<{ atomic: InjectResultDTO }> = ({
  atomic,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const location = useLocation();
  let tabValue = location.pathname;
  if (location.pathname.includes(`/admin/atomic_testings/${atomic.inject_id}/detail`)) {
    tabValue = `/admin/atomic_testings/${atomic.inject_id}/detail`;
  }
  return (
    <>
      <Breadcrumbs variant="object" elements={[
        { label: t('Atomic testings'), link: '/admin/atomic_testings' },
        { label: atomic.inject_title, current: true },
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
            to={`/admin/atomic_testings/${atomic.inject_id}`}
            value={`/admin/atomic_testings/${atomic.inject_id}`}
            label={t('Overview')}
            className={classes.item}
          />
          <Tab
            component={Link}
            to={`/admin/atomic_testings/${atomic.inject_id}/detail`}
            value={`/admin/atomic_testings/${atomic.inject_id}/detail`}
            label={t('Execution details')}
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
    </>
  );
};

const Index = () => {
  // Standard hooks
  const dispatch = useAppDispatch();

  // Fetching data
  const { injectId } = useParams() as { injectId: InjectResultDTO['inject_id'] };
  const [injectResultDto, setInjectResultDto] = useState<InjectResultDTO>();

  useEffect(() => {
    fetchInjectResultDto(injectId).then((result: { data: InjectResultDTO }) => {
      setInjectResultDto(result.data);
    });
  }, [injectId]);

  // Context
  const context: AtomicTestingResultContextType = {
    onLaunchAtomicTesting(): void {
      dispatch(fetchAtomicTesting(injectId));
      dispatch(fetchAtomicTestingDetail(injectId));
    },
  };

  if (injectResultDto) {
    return (
      <AtomicTestingResultContext.Provider value={context}>
        <IndexAtomicTestingComponent atomic={injectResultDto} />
      </AtomicTestingResultContext.Provider>
    );
  }
  return <Loader />;
};

export default Index;
