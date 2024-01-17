import { Dispatch } from 'redux';
import type { AssetGroup, AssetGroupInput, UpdateAssetsOnAssetGroupInput } from '../../utils/api-types';
import { delReferential, getReferential, postReferential, putReferential } from '../../utils/Action';
import { arrayOfAssetGroups, assetGroup } from './assetgroup-schema';

const ASSET_GROUP_URI = '/api/asset_groups';

export const addAssetGroup = (data: AssetGroupInput) => (dispatch: Dispatch) => {
  return postReferential(assetGroup, ASSET_GROUP_URI, data)(dispatch);
};

export const updateAssetGroup = (
  assetGroupId: AssetGroup['asset_group_id'],
  data: AssetGroupInput,
) => (dispatch: Dispatch) => {
  const uri = `${ASSET_GROUP_URI}/${assetGroupId}`;
  return putReferential(assetGroup, uri, data)(dispatch);
};

export const updateAssetsOnAssetGroup = (
  assetGroupId: AssetGroup['asset_group_id'],
  data: UpdateAssetsOnAssetGroupInput,
) => (dispatch: Dispatch) => {
  const uri = `${ASSET_GROUP_URI}/${assetGroupId}/assets`;
  return putReferential(assetGroup, uri, data)(dispatch);
};

export const deleteAssetGroup = (assetGroupId: AssetGroup['asset_group_id']) => (dispatch: Dispatch) => {
  const uri = `${ASSET_GROUP_URI}/${assetGroupId}`;
  return delReferential(uri, assetGroup.key, assetGroupId)(dispatch);
};

export const fetchAssetGroups = () => (dispatch: Dispatch) => {
  return getReferential(arrayOfAssetGroups, ASSET_GROUP_URI)(dispatch);
};

export const fetchAssetGroup = (assetGroupId: AssetGroup['asset_group_id']) => (dispatch: Dispatch) => {
  const uri = `${ASSET_GROUP_URI}/${assetGroupId}`;
  return getReferential(assetGroup, uri)(dispatch);
};
