import * as R from 'ramda';
import { useContext } from 'react';

import { type LoggedHelper, type UserHelper } from '../actions/helper';
import { type ScenariosHelper } from '../actions/scenarios/scenario-helper';
import { useHelper } from '../store';
import { AbilityContext } from './permissions/PermissionsProvider';
import { ACTIONS, SUBJECTS } from './permissions/types';

const useScenarioPermissions = (scenarioId: string, fullScenario = null) => {
  const ability = useContext(AbilityContext);

  const { scenario, me, logged } = useHelper((helper: ScenariosHelper & UserHelper & LoggedHelper) => {
    return {
      scenario: helper.getScenario(scenarioId),
      me: helper.getMe(),
      logged: helper.logged(),
    };
  });
  if ((!fullScenario && !scenario) || !me) {
    return {
      canAccess: false,
      canManage: false,
      canLaunch: false,
      readOnly: true, // todo : check if it's useful
      isLoggedIn: !R.isEmpty(logged), // todo : check if it's useful
      isRunning: false, // todo : check if it's useful
    };
  }

  const canAccess = ability.can(ACTIONS.ACCESS, SUBJECTS.RESOURCE, scenarioId);
  const canManage = ability.can(ACTIONS.MANAGE, SUBJECTS.RESOURCE, scenarioId);
  const canLaunch = ability.can(ACTIONS.LAUNCH, SUBJECTS.RESOURCE, scenarioId);

  return {
    canAccess,
    canManage,
    canLaunch,
    readOnly: !canManage,
    isLoggedIn: !R.isEmpty(logged),
    isRunning: false,
  };
};

export default useScenarioPermissions;
