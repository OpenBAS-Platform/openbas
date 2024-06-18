import type { Inject } from '../../../../utils/api-types';
import { addInjectForScenario, deleteInjectScenario, updateInjectActivationForScenario, updateInjectForScenario } from '../../../../actions/Inject';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import type { InjectStore } from '../../../../actions/injects/Inject';
import { fetchScenarioTeams } from '../../../../actions/scenarios/scenario-actions';

const injectContextForScenario = (scenario: ScenarioStore) => {
  const dispatch = useAppDispatch();

  return {
    async onAddInject(inject: Inject): Promise<{ result: string }> {
      await dispatch(addInjectForScenario(scenario.scenario_id, inject));
      return dispatch(fetchScenarioTeams(scenario.scenario_id));
    },
    async onUpdateInject(injectId: Inject['inject_id'], inject: Inject): Promise<{ result: string }> {
      await dispatch(updateInjectForScenario(scenario.scenario_id, injectId, inject));
      return dispatch(fetchScenarioTeams(scenario.scenario_id));
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
  };
};

export default injectContextForScenario;
