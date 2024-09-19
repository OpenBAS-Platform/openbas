import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { interval } from 'rxjs';
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
import { FIVE_SECONDS } from '../../../../utils/Time';

const interval$ = interval(FIVE_SECONDS);

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

const Index = () => {
  const classes = useStyles();
  const { t } = useFormatter();
  const location = useLocation();
  let tabValue = location.pathname;

  // Fetching data
  const { injectId } = useParams() as { injectId: InjectResultDTO['inject_id'] };
  const [injectResultDto, setInjectResultDto] = useState<InjectResultDTO>();

  const updateInjectResultDto = () => {
    fetchInjectResultDto(injectId).then((result: { data: InjectResultDTO }) => {
      setInjectResultDto(result.data);
    });
  };

  useEffect(() => {
    fetchInjectResultDto(injectId).then((result: { data: InjectResultDTO }) => {
      setInjectResultDto(result.data);
    });
  }, [injectId]);

  useEffect(() => {
    const subscription = interval$.subscribe(() => {
      fetchInjectResultDto(injectId).then((result: { data: InjectResultDTO }) => {
        if (result.data.inject_updated_at !== injectResultDto?.inject_updated_at) {
          setInjectResultDto(result.data);
        }
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [injectResultDto]);

  if (injectResultDto) {
    if (location.pathname.includes(`/admin/atomic_testings/${injectResultDto.inject_id}/detail`)) {
      tabValue = `/admin/atomic_testings/${injectResultDto.inject_id}/detail`;
    }
    return (
      <InjectResultDtoContext.Provider value={{ injectResultDto, updateInjectResultDto }}>
        <Breadcrumbs variant="object" elements={[
          { label: t('Atomic testings'), link: '/admin/atomic_testings' },
          { label: injectResultDto.inject_title, current: true },
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
              to={`/admin/atomic_testings/${injectResultDto.inject_id}`}
              value={`/admin/atomic_testings/${injectResultDto.inject_id}`}
              label={t('Overview')}
              className={classes.item}
            />
            <Tab
              component={Link}
              to={`/admin/atomic_testings/${injectResultDto.inject_id}/detail`}
              value={`/admin/atomic_testings/${injectResultDto.inject_id}/detail`}
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
  }
  return <Loader />;
};

export default Index;
