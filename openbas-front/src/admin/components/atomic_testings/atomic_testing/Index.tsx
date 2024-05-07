import React, { FunctionComponent, lazy, Suspense, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Loader from '../../../../components/Loader';
import { errorWrapper } from '../../../../components/Error';
import NotFound from '../../../../components/NotFound';
import { useFormatter } from '../../../../components/i18n';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import AtomicTestingHeader from './AtomicTestingHeader';
import { fetchInjectResultDto } from '../../../../actions/atomic_testings/atomic-testing-actions';
import type { InjectResultDTO } from '../../../../utils/api-types';
import { InjectResultDtoContext } from '../InjectResultDtoContext';

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
  const [injectResultDto, setInjectResultDto] = useState<InjectResultDTO>(atomic);

  const updateInjectResultDto = (newData: InjectResultDTO) => {
    setInjectResultDto(newData);
  };

  return (
    <InjectResultDtoContext.Provider value={{ injectResultDto, updateInjectResultDto }}>
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
    </InjectResultDtoContext.Provider>
  );
};

const Index = () => {
  // Fetching data
  const { injectId } = useParams() as { injectId: InjectResultDTO['inject_id'] };
  const [injectResultDto, setInjectResultDto] = useState<InjectResultDTO>();

  useEffect(() => {
    fetchInjectResultDto(injectId).then((result: { data: InjectResultDTO }) => {
      setInjectResultDto(result.data);
    });
  }, [injectId]);

  if (injectResultDto) {
    return (
      <IndexAtomicTestingComponent atomic={injectResultDto} />
    );
  }
  return <Loader />;
};

export default Index;
