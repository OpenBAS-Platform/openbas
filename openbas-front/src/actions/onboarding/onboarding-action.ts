import type { Dispatch } from 'redux';

import { getReferential, putReferential, simpleCall } from '../../utils/Action';
import { useronboardingprogress } from './onboarding-schema';

const ONBOARDING_URI = '/api/onboarding';

export const getOnboardingProgress = () => (dispatch: Dispatch) => {
  return getReferential(useronboardingprogress, ONBOARDING_URI)(dispatch);
};

export const getOnboardingConfig = () => {
  return simpleCall(ONBOARDING_URI + '/config');
};

export const skippedCategory = (steps: string[]) => (dispatch: Dispatch) => {
  return putReferential(useronboardingprogress, ONBOARDING_URI + '/skipped', steps)(dispatch);
};
