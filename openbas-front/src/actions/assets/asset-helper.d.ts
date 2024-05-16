import type { EndpointStore } from '../../admin/components/assets/endpoints/Endpoint';

export interface EndpointHelper {
  getEndpoints: () => EndpointStore[];
  getEndpointsMap: () => Record<string, EndpointStore>;
}
