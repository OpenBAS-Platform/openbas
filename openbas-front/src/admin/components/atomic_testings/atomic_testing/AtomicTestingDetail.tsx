import { type FunctionComponent, useContext } from 'react';

import InjectStatus from '../../common/injects/status/InjectStatus';
import { InjectResultOverviewOutputContext, type InjectResultOverviewOutputContextType } from '../InjectResultOverviewOutputContext';

const AtomicTestingDetail: FunctionComponent = () => {
  // Fetching data
  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);

  return (
    <InjectStatus
      injectStatus={injectResultOverviewOutput?.inject_status ?? null}
      canShowGlobalExecutionStatus
    />
  );
};

export default AtomicTestingDetail;
