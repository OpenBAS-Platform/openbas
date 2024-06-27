import type { SecurityPlatform } from '../../../../utils/api-types';

export type SecurityPlatformStore = Omit<SecurityPlatform, 'asset_executor', 'asset_tags'> & {
  asset_tags: string[] | undefined;
  asset_executor: string | undefined;
};
