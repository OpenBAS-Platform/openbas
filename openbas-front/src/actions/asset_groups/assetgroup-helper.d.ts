import type { AssetGroupStore } from '../../admin/components/assets/asset_groups/AssetGroup';

export interface AssetGroupsHelper {
  getAssetGroups: () => AssetGroupStore[];
  getAssetGroupMaps: () => Record<string, AssetGroupStore>;
  getAssetGroup: (assetGroupId: string) => AssetGroupStore | undefined;
}
