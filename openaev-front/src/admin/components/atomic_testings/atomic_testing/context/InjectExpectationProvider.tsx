import { Alert, DialogContentText } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useContext, useMemo, useState } from 'react';

import { fetchInjectResultOverviewOutput } from '../../../../../actions/atomic_testings/atomic-testing-actions';
import { deleteInjectExpectationResult } from '../../../../../actions/Exercise';
import DialogDelete from '../../../../../components/common/DialogDelete';
import { useFormatter } from '../../../../../components/i18n';
import { type InjectExpectationResult, type InjectResultOverviewOutput } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import { atomicTestingKey } from '../../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../../utils/utils';
import type { InjectExpectationsStore } from '../../../common/injects/expectations/Expectation';
import {
  InjectResultOverviewOutputContext,
  type InjectResultOverviewOutputContextType,
} from '../../InjectResultOverviewOutputContext';
import EditInjectExpectationResultDialog from '../target_result/EditInjectExpectationResultDialog';
import TargetResultAlertsDialog from '../target_result/TargetResultAlertsDialog';
import InjectExpectationContext from './InjectExpectationContext';

const InjectExpectationProvider = ({ children, inject }: {
  children: ReactNode;
  inject: InjectResultOverviewOutput;
}) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  // With live updates on, the screen's data lives in the query cache under the atomic testing key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const atomicTestingQueryKey = liveUpdates ? atomicTestingKey(inject.inject_id) : undefined;

  const [openEditResult, setOpenEditResult] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<InjectExpectationResult | null>(null);
  const [selectedInjectExpectation, setSelectedInjectExpectation] = useState<InjectExpectationsStore | null>(null);
  const [openDeleteResult, setOpenDeleteResult] = useState<boolean>(false);
  const [openAlertsDialog, setOpenAlertsDialog] = useState<boolean>(false);

  const { updateInjectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);

  // After a result is changed: refetch the overview passed down by the screen, and with live updates
  // on, every query of the screen. The atomic testing screen holds its overview in the query cache,
  // so invalidating the key covers it; the simulation inject screen keeps it in a state, refreshed
  // through the context as before.
  const refreshAfterChange = (): Promise<unknown> => {
    const refreshOverview = () => fetchInjectResultOverviewOutput(inject.inject_id)
      .then((result: { data: InjectResultOverviewOutput }) => updateInjectResultOverviewOutput(result.data));
    if (!atomicTestingQueryKey) {
      return refreshOverview();
    }
    const overviewInCache = queryClient.getQueryData([...atomicTestingQueryKey, 'overview']) !== undefined;
    const invalidation = queryClient.invalidateQueries({ queryKey: atomicTestingQueryKey });
    return overviewInCache ? invalidation : Promise.all([invalidation, refreshOverview()]);
  };

  // -- Delete Inject Expectation Result
  const onOpenDeleteInjectExpectationResult = (injectExpectationResult: InjectExpectationResult | null = null, injectExpectationStore: InjectExpectationsStore | null = null) => {
    setSelectedResult(injectExpectationResult);
    setSelectedInjectExpectation(injectExpectationStore);
    setOpenDeleteResult(true);
  };
  const onCloseDeleteInjectExpectationResult = () => {
    setSelectedResult(null);
    setSelectedInjectExpectation(null);
    setOpenDeleteResult(false);
  };
  const onDelete = () => {
    dispatch(deleteInjectExpectationResult(selectedInjectExpectation?.inject_expectation_id ?? '', selectedResult?.sourceId ?? '')).then(() => {
      refreshAfterChange().then(() => onCloseDeleteInjectExpectationResult());
    });
  };

  // -- Create or Update Inject Expectation Result
  const onOpenEditInjectExpectationResultResult = (result: InjectExpectationResult | null = null, injectExpectationStore: InjectExpectationsStore | null = null) => {
    setSelectedResult(result);
    setSelectedInjectExpectation(injectExpectationStore);
    setOpenEditResult(true);
  };
  const onCloseEditInjectExpectationResultResult = () => {
    setSelectedResult(null);
    setSelectedInjectExpectation(null);
    setOpenEditResult(false);
  };
  const onUpdateValidation = () => {
    refreshAfterChange().then(() => onCloseEditInjectExpectationResultResult());
  };

  const onOpenAlertsDialog = (result: InjectExpectationResult | null = null, injectExpectationStore: InjectExpectationsStore | null = null) => {
    setSelectedResult(result);
    setSelectedInjectExpectation(injectExpectationStore);
    setOpenAlertsDialog(true);
  };

  const onCloseAlertsDialog = () => {
    setSelectedResult(null);
    setSelectedInjectExpectation(null);
    setOpenAlertsDialog(false);
  };

  // Asset-level expectation (no agent): its result rows are the aggregation of the
  // agents' security platform results, so deleting one cascades to all agents.
  const isAssetLevelResultDeletion = !!selectedInjectExpectation?.inject_expectation_asset
    && !selectedInjectExpectation?.inject_expectation_agent;

  const computeExistingSourceIds = (results: InjectExpectationResult[]) => {
    const sourceIds: string[] = [];
    results.forEach((result) => {
      if (result.sourceId) {
        sourceIds.push(result.sourceId);
      }
    });
    return sourceIds;
  };

  const contextValue = useMemo(() => ({
    onOpenDeleteInjectExpectationResult,
    onOpenEditInjectExpectationResultResult,
    onOpenAlertsDialog,
    atomicTestingQueryKey,
  }),
  [onOpenDeleteInjectExpectationResult,
    onOpenEditInjectExpectationResultResult,
    onOpenAlertsDialog,
    atomicTestingQueryKey]);

  return (
    <InjectExpectationContext.Provider value={contextValue}>
      {children}
      {openEditResult && (
        <EditInjectExpectationResultDialog
          open={openEditResult}
          injectExpectation={selectedInjectExpectation}
          sourceIds={computeExistingSourceIds(selectedInjectExpectation?.inject_expectation_results ?? [])}
          onClose={onCloseEditInjectExpectationResultResult}
          onUpdate={onUpdateValidation}
          resultToEdit={selectedResult}
        />
      )}
      {openDeleteResult && (
        <DialogDelete
          open={openDeleteResult}
          handleClose={onCloseDeleteInjectExpectationResult}
          text={t('Do you want to delete this expectation result?')}
          // Asset-level rows aggregate the agents' security platform results: deleting one
          // cascades to every agent of the asset, so warn explicitly before submitting.
          richContent={isAssetLevelResultDeletion ? (
            <>
              <DialogContentText>
                {t('Do you want to delete this expectation result?')}
              </DialogContentText>
              <Alert severity="warning" style={{ marginTop: 16 }}>
                {t('This result is an aggregation: deleting it will also delete the results of this security platform for all agents of this asset.')}
              </Alert>
            </>
          ) : undefined}
          handleSubmit={onDelete}
        />
      ) }
      {selectedInjectExpectation && (
        <TargetResultAlertsDialog
          injectExpectation={selectedInjectExpectation}
          sourceId={selectedResult?.sourceId ?? ''}
          expectationResult={selectedResult}
          open={openAlertsDialog}
          handleClose={onCloseAlertsDialog}
          atomicTestingQueryKey={atomicTestingQueryKey}
        />
      )}
    </InjectExpectationContext.Provider>
  );
};

export default InjectExpectationProvider;
