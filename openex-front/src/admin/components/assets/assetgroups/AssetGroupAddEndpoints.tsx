import React, { FunctionComponent, useState } from 'react';
import { useAppDispatch } from '../../../../utils/hooks';
import { updateAssetsOnAssetGroup } from '../../../../actions/assetgroups/assetgroup-action';
import ButtonCreate from '../../../../components/common/ButtonCreate';
import EndpointsDialogAdding from '../endpoints/EndpointsDialogAdding';
import { useFormatter } from '../../../../components/i18n';

interface Props {
  assetGroupId: string;
  assetGroupEndpointIds: string[];
}

const AssetGroupAddEndpoints: FunctionComponent<Props> = ({
  assetGroupId,
  assetGroupEndpointIds,
}) => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Dialog
  const [open, setOpen] = useState(false);

  const onClose = () => setOpen(false);

  const onSubmit = (endpointIds: string[]) => {
    return dispatch(updateAssetsOnAssetGroup(assetGroupId, {
      asset_group_assets: endpointIds,
    }));
  };

  return (
    <>
      <ButtonCreate onClick={() => setOpen(true)} />
      <EndpointsDialogAdding initialState={assetGroupEndpointIds} open={open}
                             onClose={onClose} onSubmit={onSubmit}
                             title={t('Add endpoints in this asset group')} />
    </>
  );
};

export default AssetGroupAddEndpoints;
