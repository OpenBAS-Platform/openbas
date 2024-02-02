import type { EndpointStore } from '../../admin/components/assets/endpoints/Endpoint';

export interface EndpointsHelper {
  getEndpoints: () => EndpointStore[];
  getEndpointsMap: () => Record<string, EndpointStore>;
}
