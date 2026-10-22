import { type FunctionComponent, useState } from 'react';

import { updateAssetsOnAssetGroup } from '../../../../actions/asset_groups/assetgroup-action';
import ButtonPopover from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import { useFormatter } from '../../../../components/i18n';
import { type AssetOutput, type EndpointOverviewOutput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import { useAbility } from '../../../../utils/permissions/permissionsContext';
import { ACTIONS, SUBJECTS } from '../../../../utils/permissions/types';
import AssetActionDialogs, { type EditableAsset } from './AssetActionDialogs';

export interface AssetPopoverProps {
  inline?: boolean;
  // A popover row is a generic asset: the inventory and asset-group drawers hold any asset type
  // (endpoints, AI targets, identities, cloud / web / network / generic). Edit and delete are
  // dispatched by asset type; contextual removal (asset group / inject) is gated by its own props.
  endpoint: EditableAsset;
  assetGroupId?: string;
  assetGroupEndpointIds?: string[];
  removeFromContextLabel?: string | null;
  onRemoveFromContext?: (assetId: string) => void;
  onRemoveEndpointFromAssetGroup?: (asset: AssetOutput) => void;
  onUpdate?: (result: EndpointOverviewOutput) => void;
  onDelete?: (result: string) => void;
  // Offer the Update / Delete entries to a host that has no callback to run afterwards because it
  // shows the asset through live queries, which refresh on their own.
  updatable?: boolean;
  deletable?: boolean;
  // A host whose rows can leave the page on a live refetch takes over the update drawer and the
  // delete dialog: the entries call these instead of opening them here, and the host renders
  // `AssetActionDialogs` above its rows so they survive the row unmounting.
  onRequestUpdate?: (asset: EditableAsset) => void;
  onRequestDelete?: (asset: EditableAsset) => void;
  disabled?: boolean;
  agentless?: boolean;
}

const AssetPopover: FunctionComponent<AssetPopoverProps> = ({
  inline,
  endpoint,
  assetGroupId,
  assetGroupEndpointIds,
  removeFromContextLabel = null,
  onRemoveFromContext,
  onRemoveEndpointFromAssetGroup,
  onUpdate,
  onDelete,
  updatable = false,
  deletable = false,
  onRequestUpdate,
  onRequestDelete,
  disabled = false,
  agentless,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const ability = useAbility();

  const [edition, setEdition] = useState(false);
  const handleOpenEdit = () => (onRequestUpdate ? onRequestUpdate(endpoint) : setEdition(true));
  const handleCloseEdit = () => setEdition(false);

  // Removal from an asset group (contextual, not a deletion). Only the asset group pages offer it,
  // and they still read the group from the store, so this one write keeps going through it.
  const [removalFromAssetGroup, setRemovalFromAssetGroup] = useState(false);
  const handleRemoveFromAssetGroup = () => setRemovalFromAssetGroup(true);
  const submitRemoveFromAssetGroup = () => {
    if (assetGroupId) {
      dispatch(
        updateAssetsOnAssetGroup(assetGroupId, { asset_group_assets: assetGroupEndpointIds?.filter(id => id !== endpoint.asset_id) }),
      ).then(() => {
        if (onRemoveEndpointFromAssetGroup) {
          onRemoveEndpointFromAssetGroup(endpoint);
        }
        setRemovalFromAssetGroup(false);
      });
    }
  };

  const [deletion, setDeletion] = useState(false);
  const handleDelete = () => (onRequestDelete ? onRequestDelete(endpoint) : setDeletion(true));
  const handleCloseDelete = () => setDeletion(false);

  // Button Popover
  const entries = [];
  const showUpdate = !!onUpdate || updatable;
  const showDelete = !!onDelete || deletable;
  if (showUpdate) entries.push({
    label: 'Update',
    action: () => handleOpenEdit(),
    userRight: ability.can(ACTIONS.MANAGE, SUBJECTS.ASSETS),
  });
  if (onRemoveFromContext && removeFromContextLabel) entries.push({
    label: removeFromContextLabel,
    action: () => onRemoveFromContext(endpoint.asset_id),
    userRight: true,
  });
  if ((assetGroupId && endpoint.is_static)) entries.push({
    label: 'Remove from the asset group',
    action: () => handleRemoveFromAssetGroup(),
    userRight: true,
  });
  if (showDelete) entries.push({
    label: 'Delete',
    action: () => handleDelete(),
    userRight: ability.can(ACTIONS.DELETE, SUBJECTS.ASSETS),
  });

  return entries.length > 0 && (
    <>
      <ButtonPopover disabled={disabled} entries={entries} variant={inline ? 'icon' : 'toggle'} />
      <DialogDelete
        open={removalFromAssetGroup}
        handleClose={() => setRemovalFromAssetGroup(false)}
        handleSubmit={submitRemoveFromAssetGroup}
        text={t('Do you want to remove the asset from the asset group?')}
      />
      <AssetActionDialogs
        endpoint={endpoint}
        agentless={agentless}
        editing={edition && showUpdate}
        deleting={deletion}
        onCloseEdit={handleCloseEdit}
        onCloseDelete={handleCloseDelete}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  );
};

export default AssetPopover;
