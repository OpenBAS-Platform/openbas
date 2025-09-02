import { type JSX, useContext } from 'react';

import NoAccess from './NoAccess';
import { AbilityContext } from './PermissionsProvider';
import type { Actions, Subjects } from './types';

type ProtectedRouteProps = {
  action: Actions;
  subject: Subjects;
  Component: JSX.Element;
};

const ProtectedRoute = ({ action, subject, Component }: ProtectedRouteProps) => {
  const ability = useContext(AbilityContext);

  if (!ability.can(action, subject)) {
    return (
      <NoAccess />
    );
  }
  return Component;
};

export default ProtectedRoute;
