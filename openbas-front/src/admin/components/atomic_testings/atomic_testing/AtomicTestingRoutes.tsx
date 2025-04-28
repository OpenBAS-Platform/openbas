import { lazy } from 'react';
import { Route, Routes } from 'react-router';

import { errorWrapper } from '../../../../components/Error';
import NotFound from '../../../../components/NotFound';
import type { InjectResultOverviewOutput } from '../../../../utils/api-types';

interface Props { injectResultOverview: InjectResultOverviewOutput }

const AtomicTesting = lazy(() => import('./AtomicTesting'));
const AtomicTestingDetail = lazy(() => import('./AtomicTestingDetail'));
const AtomicTestingFindings = lazy(() => import('./AtomicTestingFindings'));
const AtomicTestingPayloadInfo = lazy(() => import('./payload_info/AtomicTestingPayloadInfo'));

const openbasNmap = 'openbas_nmap';

const AtomicTestingRoutes = ({ injectResultOverview }: Props) => {
  return (
    <Routes>
      <Route path="" element={errorWrapper(AtomicTesting)()} />
      {(injectResultOverview.inject_injector_contract?.injector_contract_payload
        || injectResultOverview.inject_type === openbasNmap) && (
        <Route path="findings" element={errorWrapper(AtomicTestingFindings)()} />
      )}
      <Route path="detail" element={errorWrapper(AtomicTestingDetail)()} />
      {injectResultOverview.inject_injector_contract?.injector_contract_payload && (
        <Route path="payload_info" element={errorWrapper(AtomicTestingPayloadInfo)()} />
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
export default AtomicTestingRoutes;
