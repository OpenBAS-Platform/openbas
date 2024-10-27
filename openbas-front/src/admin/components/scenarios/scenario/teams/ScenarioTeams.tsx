import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import * as React from 'react';
import { Paper, Typography } from '@mui/material';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../../../../utils/hooks';
import {
  fetchScenarioTeams,
} from '../../../../../actions/scenarios/scenario-actions';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import type { TeamStore } from '../../../../../actions/teams/Team';
import { PermissionsContext, TeamContext } from '../../../common/Context';
import UpdateTeams from '../../../components/teams/UpdateTeams';
import { useFormatter } from '../../../../../components/i18n';
import ContextualTeams from '../../../components/teams/ContextualTeams';
import teamContextForScenario from './teamContextForScenario';

interface Props {
  scenarioTeamsUsers: ScenarioStore['scenario_teams_users'],
}

const ScenarioTeams: React.FC<Props> = ({ scenarioTeamsUsers }) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { permissions } = useContext(PermissionsContext);

  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const { teamsStore }: { teamsStore: TeamStore[] } = useHelper((helper: ScenariosHelper) => ({
    teamsStore: helper.getScenarioTeams(scenarioId),
  }));
  useDataLoader(() => {
    dispatch(fetchScenarioTeams(scenarioId));
  });

  const [teams, setTeams] = useState<TeamStore[]>([]);
  useEffect(() => {
    setTeams(teamsStore);
  }, [teamsStore]);

  return (
    <TeamContext.Provider value={teamContextForScenario(scenarioId, scenarioTeamsUsers)}>
      <Typography variant="h4" gutterBottom style={{ float: 'left' }}>
        {t('Teams')}
      </Typography>
      {permissions.canWrite
        && <UpdateTeams
          addedTeamIds={teams.map((team: TeamStore) => team.team_id)}
          setTeams={(ts: TeamStore[]) => setTeams(ts)}
           />
      }
      <div className="clearfix" />
      <Paper sx={{ minHeight: '100%', padding: 2 }} variant="outlined">
        <ContextualTeams teams={teams} />
      </Paper>
    </TeamContext.Provider>
  );
};

export default ScenarioTeams;
