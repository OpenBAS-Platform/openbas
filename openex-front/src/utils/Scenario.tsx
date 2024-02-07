import * as R from 'ramda';
import { useHelper } from '../store';
import type { ScenariosHelper } from '../actions/scenarios/scenario-helper';
import type { LoggedHelper, UsersHelper } from '../actions/helper';

const useScenarioPermissions = (scenarioId: string, fullScenario = null) => {
  const { scenario, me, logged } = useHelper((helper: ScenariosHelper & UsersHelper & LoggedHelper) => {
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
      canReadBypassStatus: false,
      canWriteBypassStatus: false,
      canPlayBypassStatus: false,
      readOnly: true,
      readOnlyBypassStatus: true,
      isLoggedIn: !R.isEmpty(logged),
    };
  }
  const canReadBypassStatus = logged.admin
    || (scenario || fullScenario).exercise_observers?.includes(me.user_id);
  const canRead = logged.admin
    || (scenario || fullScenario).exercise_status === 'FINISHED'
    || (scenario || fullScenario).exercise_status === 'CANCELED'
    || (scenario || fullScenario).exercise_observers?.includes(me.user_id);
  const canWriteBypassStatus = logged.admin
    || (scenario || fullScenario).exercise_planners?.includes(me.user_id);
  const canWrite = logged.admin
    || (scenario || fullScenario).exercise_status === 'FINISHED'
    || (scenario || fullScenario).exercise_status === 'CANCELED'
    || (scenario || fullScenario).exercise_planners?.includes(me.user_id);
  const canPlayBypassStatus = logged.admin
    || (scenario || fullScenario).exercise_users?.includes(me.user_id);
  const canPlay = logged.admin
    || (scenario || fullScenario).exercise_status === 'FINISHED'
    || (scenario || fullScenario).exercise_status === 'CANCELED'
    || (scenario || fullScenario).exercise_users?.includes(me.user_id);
  return {
    canRead,
    canWrite,
    canPlay,
    canReadBypassStatus,
    canWriteBypassStatus,
    canPlayBypassStatus,
    readOnly: !canWrite,
    readOnlyBypassStatus: !canWriteBypassStatus,
    isLoggedIn: !R.isEmpty(logged),
  };
};

export default useScenarioPermissions;
