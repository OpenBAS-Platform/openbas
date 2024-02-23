import React from 'react';
import TeamsComponent from '../components/teams/Teams';
import { PermissionsContext, PermissionsContextType } from '../components/Context';
import { useHelper } from '../../../store';
import type { UsersHelper } from '../../../actions/helper';
import CreateTeam from '../components/teams/CreateTeam';
import type { TeamStore } from '../../../actions/teams/Team';
import type { User } from '../../../utils/api-types';
import type { TeamsHelper } from '../../../actions/teams/team-helper';

const Teams = () => {
  const { user, teams }: { user: User, teams: TeamStore[] } = useHelper((helper: UsersHelper & TeamsHelper) => ({
    user: helper.getMe(),
    teams: helper.getTeams(),
  }));

  const context: PermissionsContextType = {
    permissions: {
      readOnly: false,
      canWrite: user.user_is_planner || false,
      isRunning: false,
    },
  };

  return (
    <PermissionsContext.Provider value={context}>
      <TeamsComponent teamIds={teams.filter((t) => !t.team_contextual).map((t) => t.team_id)} />
      {(user.user_is_planner
        && (<CreateTeam onCreate={() => {
        }}
            />)
      )}
    </PermissionsContext.Provider>
  );
};

export default Teams;
