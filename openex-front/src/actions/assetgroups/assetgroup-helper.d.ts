import type { AssetGroup } from '../../utils/api-types';

export interface AssetGroupsHelper {
  getAssetGroups: () => [AssetGroup];
  getAssetGroup: (assetGroupId: string) => AssetGroup;
}
