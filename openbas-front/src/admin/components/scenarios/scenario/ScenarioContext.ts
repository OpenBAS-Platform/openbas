import type { Inject, InjectsImportInput, ImportMessage } from '../../../../utils/api-types';
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
import { fetchScenario, fetchScenarioTeams, importXls } from '../../../../actions/scenarios/scenario-actions';
import { MESSAGING$ } from '../../../../utils/Environment';
import { useFormatter } from '../../../../components/i18n';

const injectContextForScenario = (scenario: ScenarioStore) => {
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

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
    onImportInjectFromXls(importId: string, input: InjectsImportInput): Promise<void> {
      return importXls(scenario.scenario_id, importId, input).then((response) => new Promise((resolve, _reject) => {
        dispatch(fetchScenarioInjects(scenario.scenario_id));
        dispatch(fetchScenario(scenario.scenario_id));
        dispatch(fetchScenarioTeams(scenario.scenario_id));
        const criticalMessages = response.data.import_message.filter((value: ImportMessage) => value.message_level === 'CRITICAL');
        if (criticalMessages?.length > 0) {
          MESSAGING$.notifyError(t(criticalMessages[0].message_code), true);
        }
        resolve();
      }));
    },
    onBulkDeleteInjects(injectIds: string[]): void {
      return dispatch(bulkDeleteInjectsForScenario(scenario.scenario_id, injectIds));
    },
  };
};

export default injectContextForScenario;
