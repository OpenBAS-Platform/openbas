import { useQuery } from '@tanstack/react-query';
import { type FunctionComponent } from 'react';

import { ASSET_TYPE, assetQueries } from '../../../../actions/assets/asset-queries';
import { updateAssetMarkingsCall, updateEndpointCall } from '../../../../actions/assets/endpoint-actions';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import type { Endpoint, EndpointInput } from '../../../../utils/api-types';
import { useLiveMutation } from '../../../../utils/query/live';
import { type AssetCategory } from '../asset-categories';
import AssetForm from '../AssetForm';

interface Props {
  open: boolean;
  handleClose: () => void;
  agentless?: boolean;
  onUpdate?: (result: Endpoint) => void;
  endpointId: string;
}

const EndpointUpdate: FunctionComponent<Props> = ({
  open,
  handleClose,
  agentless,
  onUpdate,
  endpointId,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const { data: endpoint, isPending } = useQuery(assetQueries.editable(endpointId));

  const updateMutation = useLiveMutation({
    mutationFn: (data: EndpointInput) => updateEndpointCall(endpointId, data),
    changes: () => [{
      type: ASSET_TYPE,
      id: endpointId,
      action: 'update',
    }],
  });
  const markingsMutation = useLiveMutation({
    mutationFn: (markingIds: string[]) => updateAssetMarkingsCall(endpointId, { asset_markings: markingIds }, false),
    changes: () => [{
      type: ASSET_TYPE,
      id: endpointId,
      action: 'update',
    }],
  });

  // Returns whether the update actually succeeded - AssetForm awaits this (SubmitHandler's own
  // return type, `unknown`, already permits it) to decide whether to revert a markings change that
  // committed earlier in the same submit. See AssetForm's `onSubmit` doc.
  const onSubmit = async (data: EndpointInput) => {
    try {
      const result = await updateMutation.mutateAsync(data);
      onUpdate?.(result.data);
      handleClose();
      return true;
    } catch {
      // The API layer already notified the user.
      return false;
    }
  };

  // Runs (and is awaited by AssetForm) before the main endpoint update - see AssetForm's
  // `onMarkingsChange` doc for why the two can't fire concurrently, and for why returning `false`
  // here cancels the endpoint update too. Success toast suppressed since the endpoint update
  // already confirms the save to the user; a failure still notifies, so the user sees why nothing
  // happened.
  const onMarkingsChange = async (markingIds: string[]): Promise<boolean> => {
    try {
      await markingsMutation.mutateAsync(markingIds);
      return true;
    } catch {
      return false;
    }
  };

  const category = (endpoint?.asset_category as AssetCategory) ?? 'HOST';
  // The drawer shell renders immediately so the slide-in animation plays and the
  // underlying screen never shows a full-page loader; the fetch only swaps the
  // drawer body content.
  return (
    <Drawer
      open={open}
      handleClose={handleClose}
      title={t('Update an asset')}
    >
      {isPending || !endpoint
        ? <Loader variant="inElement" />
        : (
            <AssetForm
              category={category}
              initialValues={endpoint as unknown as Partial<EndpointInput> & { asset_markings?: string[] | null }}
              editing
              onSubmit={onSubmit}
              onMarkingsChange={onMarkingsChange}
              agentless={agentless}
              handleClose={handleClose}
            />
          )}
    </Drawer>
  );
};

export default EndpointUpdate;
