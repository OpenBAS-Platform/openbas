import { Props } from 'html-react-parser/lib/attributes-to-props';
import { FunctionComponent, useContext } from 'react';

import { EndpointOutput } from '../../../../utils/api-types';
import InjectStatus from '../../common/injects/status/InjectStatus';
import { InjectResultOverviewOutputContext, InjectResultOverviewOutputContextType } from '../InjectResultOverviewOutputContext';

const AtomicTestingDetail: FunctionComponent<Props> = () => {
  // Fetching data
  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);

  const endpointsMap: Map<string, EndpointOutput> = new Map();
  injectResultOverviewOutput?.inject_targets.forEach((result) => {
    if (result.targetType === 'ASSETS_GROUPS' && result.children) {
      result.children.forEach(({ id, name, platformType }) => {
        endpointsMap.set(id, { asset_id: id, asset_name: name, endpoint_platform: platformType } as EndpointOutput);
      });
    }
    if (result.targetType === 'ASSETS') {
      endpointsMap.set(result.id, { asset_id: result.id, asset_name: result.name, endpoint_platform: result.platformType } as EndpointOutput);
    }
  });

  return (
    <InjectStatus
      injectStatus={injectResultOverviewOutput?.inject_status ?? null}
      endpointsMap={endpointsMap}
    />
  );
};

export default AtomicTestingDetail;
