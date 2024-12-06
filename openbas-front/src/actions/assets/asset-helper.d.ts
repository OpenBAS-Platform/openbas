import type { SecurityPlatformStore } from '../../admin/components/assets/security_platforms/SecurityPlatform';
import { Endpoint } from '../../utils/api-types';

export interface EndpointHelper {
  getEndpoints: () => Endpoint[];
  getEndpointsMap: () => Record<string, Endpoint>;
}

export interface SecurityPlatformHelper {
  getSecurityPlatforms: () => SecurityPlatformStore[];
  getSecurityPlatformsMap: () => Record<string, SecurityPlatformStore>;
}
