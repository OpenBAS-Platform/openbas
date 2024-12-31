import { Endpoint, SecurityPlatform } from '../../utils/api-types';

export interface EndpointHelper {
  getEndpoints: () => Endpoint[];
  getEndpointsMap: () => Record<string, Endpoint>;
}

export interface SecurityPlatformHelper {
  getSecurityPlatforms: () => SecurityPlatform[];
  getSecurityPlatformsMap: () => Record<string, SecurityPlatform>;
}
