import type { SecurityPlatform } from '../../../../utils/api-types';

export type SecurityPlatformStore = Omit<SecurityPlatform, 'asset_tags'> & {
  asset_tags: string[] | undefined;
};
