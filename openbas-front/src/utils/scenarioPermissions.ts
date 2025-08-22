import * as R from 'ramda';
import { useContext } from 'react';

import { type LoggedHelper, type UserHelper } from '../actions/helper';
import { type ScenariosHelper } from '../actions/scenarios/scenario-helper';
import { useHelper } from '../store';
import { AbilityContext } from './permissions/PermissionsProvider';
import { ACTIONS, SUBJECTS } from './permissions/types';

const useScenarioPermissions = (scenarioId: string) => {
  const ability = useContext(AbilityContext);

  const { logged } = useHelper((helper: ScenariosHelper & UserHelper & LoggedHelper) => {
    return { logged: helper.logged() };
  });

  const canAccess = ability.can(ACTIONS.ACCESS, SUBJECTS.RESOURCE, scenarioId);
  const canManage = ability.can(ACTIONS.MANAGE, SUBJECTS.RESOURCE, scenarioId);
  const canLaunch = ability.can(ACTIONS.LAUNCH, SUBJECTS.RESOURCE, scenarioId);

  return {
    canAccess,
    canManage,
    canLaunch,
    readOnly: !canManage, // todo : check where is it useful
    isLoggedIn: !R.isEmpty(logged), // todo : check where is it useful
    isRunning: false, // todo : check where is it useful
  };
};

export default useScenarioPermissions;
