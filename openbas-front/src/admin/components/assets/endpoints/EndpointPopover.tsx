import { MoreVert } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import * as React from 'react';

import { updateAssetsOnAssetGroup } from '../../../../actions/asset_groups/assetgroup-action';
import { deleteEndpoint, updateEndpoint } from '../../../../actions/assets/endpoint-actions';
import Dialog from '../../../../components/common/Dialog';
import DialogDelete from '../../../../components/common/DialogDelete';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import type { EndpointInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import type { EndpointStore } from './Endpoint';
import EndpointForm from './EndpointForm';
import { EndpointStoreWithType } from './EndpointsList';

interface Props {
  inline?: boolean;
  endpoint: EndpointStoreWithType;
  assetGroupId?: string;
  assetGroupEndpointIds?: string[];
  onRemoveEndpointFromInject?: (assetId: string) => void;
  onRemoveEndpointFromAssetGroup?: (assetId: string) => void;
  openEditOnInit?: boolean;
  onUpdate?: (result: EndpointStore) => void;
  onDelete?: (result: string) => void;
}

const EndpointPopover: React.FC<Props> = ({
  inline,
  endpoint,
  assetGroupId,
  assetGroupEndpointIds,
  onRemoveEndpointFromInject,
  onRemoveEndpointFromAssetGroup,
  openEditOnInit = false,
  onUpdate,
  onDelete,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const initialValues = {
    asset_name: endpoint.asset_name,
    asset_description: endpoint.asset_description ?? '',
    asset_last_seen: endpoint.asset_last_seen ?? undefined,
    asset_tags: endpoint.asset_tags,
    endpoint_hostname: endpoint.endpoint_hostname,
    endpoint_ips: endpoint.endpoint_ips,
    endpoint_mac_addresses: endpoint.endpoint_mac_addresses ?? [],
    endpoint_platform: endpoint.endpoint_platform,
    endpoint_arch: endpoint.endpoint_arch,
  };

  // Edition
  const [edition, setEdition] = useState(openEditOnInit);

  const handleEdit = () => {
    setEdition(true);
    setAnchorEl(null);
  };
  const submitEdit = (data: EndpointInput) => {
    dispatch(updateEndpoint(endpoint.asset_id, data)).then(
      (result: { result: string; entities: { endpoints: Record<string, EndpointStore> } }) => {
        if (result.entities) {
          if (onUpdate) {
            const endpointUpdated = result.entities.endpoints[result.result];
            onUpdate(endpointUpdated);
          }
        }
        return result;
      },
    );
    setEdition(false);
  };

  // Removal
  const [removalFromAssetGroup, setRemovalFromAssetGroup] = useState(false);

  const handleRemoveFromAssetGroup = () => {
    setRemovalFromAssetGroup(true);
    setAnchorEl(null);
  };
  const submitRemoveFromAssetGroup = () => {
    if (assetGroupId) {
      dispatch(
        updateAssetsOnAssetGroup(assetGroupId, {
          asset_group_assets: assetGroupEndpointIds?.filter(id => id !== endpoint.asset_id),
        }),
      ).then(() => {
        if (onRemoveEndpointFromAssetGroup) {
          onRemoveEndpointFromAssetGroup(endpoint.asset_id);
        }
        setRemovalFromAssetGroup(false);
      });
    }
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);

  const handleDelete = () => {
    setDeletion(true);
    setAnchorEl(null);
  };
  const submitDelete = () => {
    dispatch(deleteEndpoint(endpoint.asset_id)).then(
      () => {
        if (onDelete) {
          onDelete(endpoint.asset_id);
        }
      },
    );
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
        {(assetGroupId && endpoint.type !== 'dynamic') && (
          <MenuItem onClick={handleRemoveFromAssetGroup}>
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
            editing
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
        open={removalFromAssetGroup}
        handleClose={() => setRemovalFromAssetGroup(false)}
        handleSubmit={submitRemoveFromAssetGroup}
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
