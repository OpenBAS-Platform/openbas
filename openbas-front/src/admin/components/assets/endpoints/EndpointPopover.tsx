import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import type { EndpointInput } from '../../../../utils/api-types';
import EndpointForm from './EndpointForm';
import { useAppDispatch } from '../../../../utils/hooks';
import { deleteEndpoint, updateEndpoint } from '../../../../actions/assets/endpoint-actions';
import Drawer from '../../../../components/common/Drawer';
import DialogDelete from '../../../../components/common/DialogDelete';
import type { EndpointStore } from './Endpoint';
import { updateAssetsOnAssetGroup } from '../../../../actions/assetgroups/assetgroup-action';
import Dialog from '../../../../components/common/Dialog';

interface Props {
  inline?: boolean;
  endpoint: EndpointStore;
  assetGroupId?: string;
  assetGroupEndpointIds?: string[];
  onRemoveEndpointFromInject?: (assetId: string) => void;
}

const EndpointPopover: React.FC<Props> = ({
  inline,
  endpoint,
  assetGroupId,
  assetGroupEndpointIds,
  onRemoveEndpointFromInject,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const initialValues = (({
    asset_name,
    asset_description,
    asset_last_seen,
    asset_tags,
    endpoint_hostname,
    endpoint_ips,
    endpoint_mac_addresses,
    endpoint_platform,
  }) => ({
    asset_name,
    asset_description,
    asset_last_seen: asset_last_seen ?? undefined,
    asset_tags,
    endpoint_hostname,
    endpoint_ips,
    endpoint_mac_addresses: endpoint_mac_addresses ?? [],
    endpoint_platform,
  }))(endpoint);

  // Edition
  const [edition, setEdition] = useState(false);

  const handleEdit = () => {
    setEdition(true);
    setAnchorEl(null);
  };
  const submitEdit = (data: EndpointInput) => {
    dispatch(updateEndpoint(endpoint.asset_id, data));
    setEdition(false);
  };

  // Removal
  const [removal, setRemoval] = useState(false);

  const handleRemove = () => {
    setRemoval(true);
    setAnchorEl(null);
  };
  const submitRemove = () => {
    if (assetGroupId) {
      dispatch(
        updateAssetsOnAssetGroup(assetGroupId, {
          asset_group_assets: assetGroupEndpointIds?.filter((id) => id !== endpoint.asset_id),
        }),
      ).then(() => setRemoval(false));
    }
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);

  const handleDelete = () => {
    setDeletion(true);
    setAnchorEl(null);
  };
  const submitDelete = () => {
    dispatch(deleteEndpoint(endpoint.asset_id));
    setDeletion(false);
  };

  return (
    <>
      <IconButton
        color="primary"
        onClick={(ev) => {
          ev.stopPropagation();
          setAnchorEl(ev.currentTarget);
        }}
        aria-label={`endpoint menu for ${endpoint.asset_name}`}
        aria-haspopup="true"
        size="large"
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleEdit}>
          {t('Update')}
        </MenuItem>
        {assetGroupId && (
          <MenuItem onClick={handleRemove}>
            {t('Remove from the asset group')}
          </MenuItem>
        )}
        {onRemoveEndpointFromInject && (
          <MenuItem onClick={() => onRemoveEndpointFromInject(endpoint.asset_id)}>
            {t('Remove from the inject')}
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          {t('Delete')}
        </MenuItem>
      </Menu>

      {inline ? (
        <Dialog
          open={edition}
          handleClose={() => setEdition(false)}
          title={t('Update the endpoint')}
        >
          <EndpointForm
            initialValues={initialValues}
            editing={true}
            onSubmit={submitEdit}
            handleClose={() => setEdition(false)}
          />
        </Dialog>
      ) : (
        <Drawer
          open={edition}
          handleClose={() => setEdition(false)}
          title={t('Update the endpoint')}
        >
          <EndpointForm
            initialValues={initialValues}
            editing
            onSubmit={submitEdit}
            handleClose={() => setEdition(false)}
          />
        </Drawer>
      )}
      <DialogDelete
        open={removal}
        handleClose={() => setRemoval(false)}
        handleSubmit={submitRemove}
        text={t('Do you want to remove the endpoint from the asset group ?')}
      />
      <DialogDelete
        open={deletion}
        handleClose={() => setDeletion(false)}
        handleSubmit={submitDelete}
        text={t('Do you want to delete the endpoint ?')}
      />
    </>
  );
};

export default EndpointPopover;
