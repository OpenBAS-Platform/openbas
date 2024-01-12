import type { AssetGroup } from '../../../../utils/api-types';

export type AssetGroupStore = Omit<AssetGroup, 'asset_group_assets' | 'asset_group_tags'> & {
  asset_group_assets: string[] | undefined;
  asset_group_tags: string[] | undefined;
};
