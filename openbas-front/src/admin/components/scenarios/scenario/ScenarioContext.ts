import type { Inject } from '../../../../utils/api-types';
import { addInjectForScenario, deleteInjectScenario, updateInjectActivationForScenario, updateInjectForScenario } from '../../../../actions/Inject';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';

const injectContextForScenario = (scenario: ScenarioStore) => {
  const dispatch = useAppDispatch();

  return {
    onAddInject(inject: Inject): Promise<{ result: string }> {
      return dispatch(addInjectForScenario(scenario.scenario_id, inject));
    },
    onUpdateInject(injectId: Inject['inject_id'], inject: Inject): Promise<{ result: string }> {
      return dispatch(updateInjectForScenario(scenario.scenario_id, injectId, inject));
    },
    onUpdateInjectActivation(injectId: Inject['inject_id'], injectEnabled: { inject_enabled: boolean }): void {
      return dispatch(updateInjectActivationForScenario(scenario.scenario_id, injectId, injectEnabled));
    },
    onDeleteInject(injectId: Inject['inject_id']): void {
      return dispatch(deleteInjectScenario(scenario.scenario_id, injectId));
    },
  };
};

export default injectContextForScenario;
