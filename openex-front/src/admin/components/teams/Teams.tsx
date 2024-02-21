import React from 'react';
import TeamsComponent from '../components/teams/Teams';
import { PermissionsContext, PermissionsContextType } from '../components/Context';
import { useHelper } from '../../../store';
import type { UsersHelper } from '../../../actions/helper';

const Teams = () => {
  const { user } = useHelper((helper: UsersHelper) => ({
    user: helper.getMe(),
  }));

  const context: PermissionsContextType = {
    permissions: {
      readOnly: true,
      canWrite: user.user_is_planner,
    },
  };

  return (
    <PermissionsContext.Provider value={context}>
      <TeamsComponent />
    </PermissionsContext.Provider>
  );
};

export default Teams;
