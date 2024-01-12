import type { Asset, AssetGroup } from '../../utils/api-types';

export interface AssetGroupsHelper {
  getAssetGroups: () => [AssetGroup];
  getAssetsFromAssetGroup: (assetGroupId: string) => [Asset];
}
