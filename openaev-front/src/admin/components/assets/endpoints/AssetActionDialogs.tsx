import { type FunctionComponent, useEffect, useState } from 'react';

import { fetchAiTargetById, updateAiTargetCall, updateAiTargetMarkingsCall } from '../../../../actions/assets/aiTarget-actions';
import { ASSET_TYPE } from '../../../../actions/assets/asset-queries';
import { deleteAsset } from '../../../../actions/assets/endpoint-actions';
import DialogDelete from '../../../../components/common/DialogDelete';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type AiTargetInput, type AssetOutput, type EndpointOverviewOutput } from '../../../../utils/api-types';
import { useLiveMutation } from '../../../../utils/query/live';
import AiTargetForm from '../ai_targets/AiTargetForm';
import EndpointUpdate from './EndpointUpdate';

export type EditableAsset = AssetOutput & Partial<EndpointOverviewOutput>;

interface Props {
  endpoint: EditableAsset;
  agentless?: boolean;
  editing: boolean;
  deleting: boolean;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
  onUpdate?: (result: EndpointOverviewOutput) => void;
  onDelete?: (assetId: string) => void;
}

// Fields prefilled into the AI target edit form; the inventory row only carries the shared asset
// fields, so the full connection config is fetched from /api/ai_targets/{id} on edit.
// asset_markings isn't part of AiTargetInput (it's written through its own endpoint, not this
// form's submit - see AiTargetForm), but it still needs to flow into the picker's initial value.
const AI_TARGET_INPUT_KEYS: (keyof AiTargetInput | 'asset_markings')[] = [
  'asset_name',
  'ai_target_provider',
  'ai_target_modality',
  'ai_target_endpoint',
  'ai_target_model',
  'ai_target_system_prompt',
  'ai_target_token',
  'ai_target_configuration',
  'asset_criticality',
  'asset_description',
  'asset_tags',
  'asset_markings',
];

// The update drawer and the delete dialog of one asset (any type). They are separate from the
// popover so a host whose rows can leave the page on a live refetch renders them above the rows:
// an open drawer then survives its row disappearing.
const AssetActionDialogs: FunctionComponent<Props> = ({
  endpoint,
  agentless,
  editing,
  deleting,
  onCloseEdit,
  onCloseDelete,
  onUpdate,
  onDelete,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const isAiTarget = endpoint.asset_category === 'AI_TARGET';

  // AI target edit: fetch the full connection config lazily when the drawer opens.
  const [aiTargetValues, setAiTargetValues] = useState<(AiTargetInput & { asset_markings?: string[] | null }) | null>(null);
  useEffect(() => {
    if (editing && isAiTarget && !aiTargetValues) {
      fetchAiTargetById(endpoint.asset_id).then((response: { data: Record<string, unknown> }) => {
        const asset = response.data;
        const values = Object.fromEntries(
          AI_TARGET_INPUT_KEYS.map(key => [key, asset[key]]),
        ) as unknown as AiTargetInput & { asset_markings?: string[] | null };
        setAiTargetValues(values);
      });
    }
    if (!editing) {
      setAiTargetValues(null);
    }
  }, [editing, isAiTarget, endpoint.asset_id, aiTargetValues]);

  const assetChanges = () => [{
    type: ASSET_TYPE,
    id: endpoint.asset_id,
    action: 'update' as const,
  }];
  const updateAiTargetMutation = useLiveMutation({
    mutationFn: (data: AiTargetInput) => updateAiTargetCall(endpoint.asset_id, data),
    changes: assetChanges,
  });
  const aiTargetMarkingsMutation = useLiveMutation({
    mutationFn: (markingIds: string[]) => updateAiTargetMarkingsCall(endpoint.asset_id, { asset_markings: markingIds }, false),
    changes: assetChanges,
  });

  // Returns whether the update actually succeeded - AiTargetForm awaits this (SubmitHandler's own
  // return type, `unknown`, already permits it) to decide whether to revert a markings change that
  // committed earlier in the same submit. See AssetForm's `onSubmit` doc for the full rationale.
  // The drawer closes only on success: closing on failure would hide the error from the user and
  // contradict the "form stays open on a half-applied save" guarantee the revert logic relies on.
  const submitEditAiTarget = async (data: AiTargetInput) => {
    try {
      const result = await updateAiTargetMutation.mutateAsync(data);
      onUpdate?.(result.data);
      onCloseEdit();
      return true;
    } catch {
      // The API layer already notified the user.
      return false;
    }
  };

  // Awaited by AiTargetForm before submitEditAiTarget runs - see AssetForm's `onMarkingsChange`
  // doc for why the two can't fire concurrently. Success toast suppressed since the asset update
  // above already confirms the save.
  const onMarkingsChangeAiTarget = async (markingIds: string[]): Promise<boolean> => {
    try {
      await aiTargetMarkingsMutation.mutateAsync(markingIds);
      return true;
    } catch {
      return false;
    }
  };

  // Deletion (generic: works for any asset type). `onDelete` runs from the promise rather than a
  // per-call mutate callback, which would be dropped if the host unmounted before it settled.
  const deleteMutation = useLiveMutation({
    mutationFn: () => deleteAsset(endpoint.asset_id),
    changes: () => [{
      type: ASSET_TYPE,
      id: endpoint.asset_id,
      action: 'delete',
    }],
  });
  const submitDelete = () => {
    onCloseDelete();
    deleteMutation.mutateAsync()
      .then(() => onDelete?.(endpoint.asset_id))
      // The API layer already notified the user.
      .catch(() => {});
  };

  return (
    <>
      {editing && isAiTarget && (
        <Drawer open handleClose={onCloseEdit} title={t('Update the AI target')}>
          {aiTargetValues
            ? (
                <AiTargetForm
                  initialValues={aiTargetValues}
                  editing
                  onSubmit={submitEditAiTarget}
                  onMarkingsChange={onMarkingsChangeAiTarget}
                  handleClose={onCloseEdit}
                />
              )
            : <Loader variant="inElement" />}
        </Drawer>
      )}
      {editing && !isAiTarget && (
        <EndpointUpdate
          open
          handleClose={onCloseEdit}
          endpointId={endpoint.asset_id}
          agentless={agentless}
          onUpdate={result => onUpdate?.(result as EndpointOverviewOutput)}
        />
      )}
      <DialogDelete
        open={deleting}
        handleClose={onCloseDelete}
        handleSubmit={submitDelete}
        text={`${t('Do you want to delete the asset:')} ${endpoint.asset_name}?`}
      />
    </>
  );
};

export default AssetActionDialogs;
