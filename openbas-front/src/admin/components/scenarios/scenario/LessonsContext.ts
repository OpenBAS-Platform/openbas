import type { Inject, InjectsImportInput, ImportTestSummary } from '../../../../utils/api-types';
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
import type { InjectStore } from '../../../../actions/injects/Inject';
import { dryImportXls, fetchScenario, fetchScenarioTeams, importXls } from '../../../../actions/scenarios/scenario-actions';

const lessonsContext = (scenario: ScenarioStore) => {
  const dispatch = useAppDispatch();

  return {
    onAddInject(inject: Inject): Promise<{ result: string }> {
      return dispatch(addInjectForScenario(scenario.scenario_id, inject));
    },
    onUpdateInject(injectId: Inject['inject_id'], inject: Inject): Promise<{ result: string }> {
      return dispatch(updateInjectForScenario(scenario.scenario_id, injectId, inject));
    },
    onUpdateInjectActivation(injectId: Inject['inject_id'], injectEnabled: { inject_enabled: boolean }): Promise<{
      result: string,
      entities: { injects: Record<string, InjectStore> }
    }> {
      return dispatch(updateInjectActivationForScenario(scenario.scenario_id, injectId, injectEnabled));
    },
    onDeleteInject(injectId: Inject['inject_id']): void {
      return dispatch(deleteInjectScenario(scenario.scenario_id, injectId));
    },
    onImportInjectFromXls(importId: string, input: InjectsImportInput): Promise<ImportTestSummary> {
      return importXls(scenario.scenario_id, importId, input).then((response) => new Promise((resolve, _reject) => {
        dispatch(fetchScenarioInjects(scenario.scenario_id));
        dispatch(fetchScenario(scenario.scenario_id));
        dispatch(fetchScenarioTeams(scenario.scenario_id));
        resolve(response.data);
      }));
    },
    async onDryImportInjectFromXls(importId: string, input: InjectsImportInput): Promise<ImportTestSummary> {
      return dryImportXls(scenario.scenario_id, importId, input).then((result) => result.data);
    },
    onBulkDeleteInjects(injectIds: string[]): void {
      return dispatch(bulkDeleteInjectsForScenario(scenario.scenario_id, injectIds));
    },
  };
};

export default lessonsContext;
