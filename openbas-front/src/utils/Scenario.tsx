import * as R from 'ramda';
import { useHelper } from '../store';
import type { ScenariosHelper } from '../actions/scenarios/scenario-helper';
import type { LoggedHelper, UserHelper } from '../actions/helper';
import type { ScenarioStore } from '../actions/scenarios/Scenario';

export const isScenarioReadOnly = (scenario: ScenarioStore, overrideStatus = false) => {
  if (!scenario) {
    return true;
  }
  if (overrideStatus) {
    return scenario.user_can_update === false;
  }
  return (
    scenario.scenario_status === 'FINISHED'
        || scenario.scenario_status === 'CANCELED'
        || scenario.user_can_update === false
  );
};

export const isScenarioUpdatable = (scenario: ScenarioStore, overrideStatus = false) => !isScenarioReadOnly(scenario, overrideStatus);

const useScenarioPermissions = (scenarioId: string, fullScenario = null) => {
  const { scenario, me, logged } = useHelper((helper: ScenariosHelper & UserHelper & LoggedHelper) => {
    return {
      scenario: helper.getScenario(scenarioId),
      me: helper.getMe(),
      logged: helper.logged(),
    };
  });
  if ((!fullScenario && !scenario) || !me) {
    return {
      canRead: false,
      canWrite: false,
      canPlay: false,
      readOnly: true,
      isLoggedIn: !R.isEmpty(logged),
      isRunning: false,
    };
  }
  const canRead = logged.admin
        || (scenario || fullScenario).scenario_observers?.includes(me.user_id);
  const canWrite = logged.admin
        || (scenario || fullScenario).scenario_planners?.includes(me.user_id);
  const canPlay = logged.admin
        || (scenario || fullScenario).scenario_users?.includes(me.user_id);
  return {
    canRead,
    canWrite,
    canPlay,
    readOnly: !canWrite,
    isLoggedIn: !R.isEmpty(logged),
    isRunning: false,
  };
};

export default useScenarioPermissions;
