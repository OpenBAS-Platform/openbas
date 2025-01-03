import { Endpoint, SecurityPlatform } from '../../utils/api-types';

export interface EndpointHelper {
  getEndpoint: (endpointId: Endpoint['asset_id']) => Endpoint;
  getEndpoints: () => Endpoint[];
  getEndpointsMap: () => Record<string, Endpoint>;
}

export interface SecurityPlatformHelper {
  getSecurityPlatforms: () => SecurityPlatform[];
  getSecurityPlatformsMap: () => Record<string, SecurityPlatform>;
}
