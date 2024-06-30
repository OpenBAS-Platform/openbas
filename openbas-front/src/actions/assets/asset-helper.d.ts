import type { EndpointStore } from '../../admin/components/assets/endpoints/Endpoint';
import type { SecurityPlatformStore } from '../../admin/components/assets/security_platforms/SecurityPlatform';

export interface EndpointHelper {
  getEndpoints: () => EndpointStore[];
  getEndpointsMap: () => Record<string, EndpointStore>;
}

export interface SecurityPlatformHelper {
  getSecurityPlatforms: () => SecurityPlatformStore[];
  getSecurityPlatformsMap: () => Record<string, SecurityPlatformStore>;
}
