import { schema } from 'normalizr';

// eslint-disable-next-line import/prefer-default-export
export const useronboardingprogress = new schema.Entity(
  'useronboardingprogresses',
  {},
  { idAttribute: 'onboarding_id' },
);
