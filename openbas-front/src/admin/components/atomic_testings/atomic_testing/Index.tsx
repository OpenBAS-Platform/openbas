import { Alert, AlertTitle } from '@mui/material';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { interval } from 'rxjs';

import { fetchInjectResultOverviewOutput } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type InjectResultOverviewOutput } from '../../../../utils/api-types';
import { FIVE_SECONDS } from '../../../../utils/Time';
import { TeamContext } from '../../common/Context';
import { InjectResultOverviewOutputContext } from '../InjectResultOverviewOutputContext';
import teamContextForAtomicTesting from './context/TeamContextForAtomicTesting';
import IndexHeader from './IndexHeader';
import IndexRoutes from './IndexRoutes';

const interval$ = interval(FIVE_SECONDS);

const Index = () => {
  const { t } = useFormatter();
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };

  const [pristine, setPristine] = useState(true);
  const [loading, setLoading] = useState(true);
  const [injectResultOverviewOutput, setInjectResultOverviewOutput] = useState<InjectResultOverviewOutput>();

  useEffect(() => {
    setLoading(true);
    fetchInjectResultOverviewOutput(injectId).then((result: { data: InjectResultOverviewOutput }) => {
      setInjectResultOverviewOutput(result.data);
    }).finally(() => {
      setLoading(false);
      setPristine(false);
    });
  }, [injectId]);

  useEffect(() => {
    const subscription = interval$.subscribe(() => {
      setLoading(true);
      fetchInjectResultOverviewOutput(injectId).then((result: { data: InjectResultOverviewOutput }) => {
        if (result.data.inject_updated_at !== injectResultOverviewOutput?.inject_updated_at) {
          setInjectResultOverviewOutput(result.data);
        }
      }).catch(() => {
        subscription.unsubscribe();
      }).finally(() => {
        setLoading(false);
        setPristine(false);
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [injectResultOverviewOutput]);

  const updateInjectResultOverviewOutput = () => {
    fetchInjectResultOverviewOutput(injectId).then((result: { data: InjectResultOverviewOutput }) => {
      setInjectResultOverviewOutput(result.data);
    });
  };

  if (pristine && loading) return <Loader />;

  if (!injectResultOverviewOutput) {
    return (
      <Alert severity="warning">
        <AlertTitle>{t('Warning')}</AlertTitle>
        {t('Atomic testing is currently unavailable or you do not have sufficient permissions to access it.')}
      </Alert>
    );
  }

  return (
    <TeamContext.Provider value={teamContextForAtomicTesting()}>
      <InjectResultOverviewOutputContext.Provider value={{
        injectResultOverviewOutput,
        updateInjectResultOverviewOutput,
      }}
      >
        <IndexHeader injectResultOverview={injectResultOverviewOutput} setInjectResultOverview={setInjectResultOverviewOutput} />
        <Suspense fallback={<Loader />}>
          <IndexRoutes injectResultOverview={injectResultOverviewOutput} />
        </Suspense>
      </InjectResultOverviewOutputContext.Provider>
    </TeamContext.Provider>
  );
};

export default Index;
