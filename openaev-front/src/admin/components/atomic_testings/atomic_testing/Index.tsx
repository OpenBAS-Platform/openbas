import { Alert, AlertTitle } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { interval } from 'rxjs';

import { fetchInjectResultOverviewOutput } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type InjectResultOverviewOutput } from '../../../../utils/api-types';
import { type Error as NotifiableError, notifyErrorHandler } from '../../../../utils/error/errorHandlerUtil';
import queryClient from '../../../../utils/query/queryClient';
import { FIVE_SECONDS } from '../../../../utils/Time';
import { isFeatureEnabled } from '../../../../utils/utils';
import { TeamContext } from '../../common/Context';
import { InjectResultOverviewOutputContext } from '../InjectResultOverviewOutputContext';
import AtomicTestingHeader from './AtomicTestingHeader';
import {
  ATOMIC_TESTING_REFETCH_INTERVAL_MS,
  atomicTestingOverviewKey,
  invalidateAtomicTesting,
  isClientError,
  retryUnlessClientError,
} from './atomicTestingQueries';
import AtomicTestingRoutes from './AtomicTestingRoutes';
import teamContextForAtomicTesting from './context/TeamContextForAtomicTesting';

const interval$ = interval(FIVE_SECONDS);

interface ShellProps {
  loading: boolean;
  injectResultOverviewOutput?: InjectResultOverviewOutput;
  setInjectResultOverviewOutput: (injectResultOverviewOutput: InjectResultOverviewOutput) => void;
  updateInjectResultOverviewOutput: (injectResultOverviewOutput: InjectResultOverviewOutput) => void;
}

const AtomicTestingShell = ({
  loading,
  injectResultOverviewOutput,
  setInjectResultOverviewOutput,
  updateInjectResultOverviewOutput,
}: ShellProps) => {
  const { t } = useFormatter();

  if (loading) return <Loader />;

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
        <AtomicTestingHeader injectResultOverview={injectResultOverviewOutput} setInjectResultOverview={setInjectResultOverviewOutput} />
        <Suspense fallback={<Loader />}>
          <AtomicTestingRoutes injectResultOverview={injectResultOverviewOutput} />
        </Suspense>
      </InjectResultOverviewOutputContext.Provider>
    </TeamContext.Provider>
  );
};

interface IndexProps { injectId: InjectResultOverviewOutput['inject_id'] }

// Polls the overview every 5 s.
const PolledAtomicTesting = ({ injectId }: IndexProps) => {
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

  return (
    <AtomicTestingShell
      loading={pristine && loading}
      injectResultOverviewOutput={injectResultOverviewOutput}
      setInjectResultOverviewOutput={setInjectResultOverviewOutput}
      updateInjectResultOverviewOutput={updateInjectResultOverviewOutput}
    />
  );
};

// Live updates: the overview is a query that the topic 'atomic-testing:<id>' refetches, with a
// slow interval as fallback.
const QueriedAtomicTesting = ({ injectId }: IndexProps) => {
  const overviewKey = atomicTestingOverviewKey(injectId);
  const { data, error, errorUpdatedAt, isPending } = useQuery({
    queryKey: overviewKey,
    // The error toast is shown once below, after the library's retries, not on every attempt.
    queryFn: () => fetchInjectResultOverviewOutput(injectId, false).then((result: { data: InjectResultOverviewOutput }) => result.data),
    retry: retryUnlessClientError,
    // A failing atomic testing (deleted, rights lost) stops polling, as the 5 s polling did;
    // an invalidation still refetches it.
    refetchInterval: query => (query.state.status === 'error' ? false : ATOMIC_TESTING_REFETCH_INTERVAL_MS),
  });

  useEffect(() => {
    if (error) {
      notifyErrorHandler(error as unknown as NotifiableError);
    }
  }, [errorUpdatedAt]);

  // Callers pass the overview the server returned after a change: it replaces the cached one,
  // and the other queries of the screen (targets, findings, ...) refetch.
  const applyInjectResultOverviewOutput = (injectResultOverviewOutput: InjectResultOverviewOutput) => {
    queryClient.setQueryData(overviewKey, injectResultOverviewOutput);
    invalidateAtomicTesting(injectId, { exceptOverview: true });
  };

  return (
    <AtomicTestingShell
      loading={isPending}
      // Deleted or no longer visible while on screen: show the same warning as on a first load.
      injectResultOverviewOutput={isClientError(error) ? undefined : data}
      setInjectResultOverviewOutput={applyInjectResultOverviewOutput}
      updateInjectResultOverviewOutput={applyInjectResultOverviewOutput}
    />
  );
};

const Index = () => {
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };
  // Constant for a session: the screen keeps one of the two paths.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  return liveUpdates
    ? <QueriedAtomicTesting injectId={injectId} />
    : <PolledAtomicTesting injectId={injectId} />;
};

export default Index;
