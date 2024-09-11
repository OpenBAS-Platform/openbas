import type { ImportTestSummary, Inject, InjectsImportInput, InjectTestStatus, SearchPaginationInput } from '../../../../utils/api-types';
import {
  addInjectForScenario,
  bulkDeleteInjectsForScenario,
  deleteInjectScenario,
  fetchScenarioInjects,
  updateInjectActivationForScenario,
  updateInjectForScenario,
} from '../../../../actions/Inject';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import type { InjectOutputType, InjectStore } from '../../../../actions/injects/Inject';
import { dryImportXlsForScenario, fetchScenario, fetchScenarioTeams, importXlsForScenario } from '../../../../actions/scenarios/scenario-actions';
import { Page } from '../../../../components/common/queryable/Page';
import { bulkTestInjects, searchScenarioInjectsSimple } from '../../../../actions/injects/inject-action';

const injectContextForScenario = (scenario: ScenarioStore) => {
  const dispatch = useAppDispatch();

  return {
    searchInjects(input: SearchPaginationInput): Promise<{ data: Page<InjectOutputType> }> {
      return searchScenarioInjectsSimple(scenario.scenario_id, input);
    },
    onAddInject(inject: Inject): Promise<{ result: string, entities: { injects: Record<string, InjectStore> } }> {
      return dispatch(addInjectForScenario(scenario.scenario_id, inject));
    },
    onUpdateInject(injectId: Inject['inject_id'], inject: Inject): Promise<{ result: string, entities: { injects: Record<string, InjectStore> } }> {
      return dispatch(updateInjectForScenario(scenario.scenario_id, injectId, inject));
    },
    onUpdateInjectActivation(injectId: Inject['inject_id'], injectEnabled: { inject_enabled: boolean }): Promise<{
      result: string,
      entities: { injects: Record<string, InjectStore> }
    }> {
      return dispatch(updateInjectActivationForScenario(scenario.scenario_id, injectId, injectEnabled));
    },
    onDeleteInject(injectId: Inject['inject_id']): Promise<void> {
      return dispatch(deleteInjectScenario(scenario.scenario_id, injectId));
    },
    onImportInjectFromXls(importId: string, input: InjectsImportInput): Promise<ImportTestSummary> {
      return importXlsForScenario(scenario.scenario_id, importId, input).then((response) => new Promise((resolve, _reject) => {
        dispatch(fetchScenarioInjects(scenario.scenario_id));
        dispatch(fetchScenario(scenario.scenario_id));
        dispatch(fetchScenarioTeams(scenario.scenario_id));
        resolve(response.data);
      }));
    },
    async onDryImportInjectFromXls(importId: string, input: InjectsImportInput): Promise<ImportTestSummary> {
      return dryImportXlsForScenario(scenario.scenario_id, importId, input).then((result) => result.data);
    },
    onBulkDeleteInjects(injectIds: string[]): void {
      return dispatch(bulkDeleteInjectsForScenario(scenario.scenario_id, injectIds));
    },
    bulkTestInjects(injectIds: string[]): Promise<{ uri: string, data: InjectTestStatus[] }> {
      return bulkTestInjects(injectIds).then((result) => ({
        uri: `/admin/scenarios/${scenario.scenario_id}/tests`,
        data: result.data,
      }));
    },
  };
};

export default injectContextForScenario;
