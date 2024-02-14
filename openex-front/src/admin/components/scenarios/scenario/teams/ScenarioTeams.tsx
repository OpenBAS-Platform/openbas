import { useParams } from 'react-router-dom';
import React from 'react';
import { makeStyles } from '@mui/styles';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../../utils/hooks';
import { fetchScenarioTeams } from '../../../../../actions/scenarios/scenario-actions';
import DefinitionMenu from '../../../components/DefinitionMenu';
import AddTeams from '../../../components/teams/AddTeams';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import useScenarioPermissions from '../../../../../utils/Scenario';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import type { TeamStore } from '../../../../../actions/teams/Team';
import Teams from '../../../components/teams/Teams';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

const ScenarioTeams = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  const { teams }: { scenario: ScenarioStore, teams: TeamStore[] } = useHelper((helper: ScenariosHelper) => ({
    teams: helper.getScenarioTeams(scenarioId),
  }));
  const permissions = useScenarioPermissions(scenarioId);

  useDataLoader(() => {
    dispatch(fetchScenarioTeams(scenarioId));
  });

  return (
    <div className={classes.container}>
      <DefinitionMenu base="/admin/scenarios" id={scenarioId} />
      <Teams currentTeamIds={teams.map((t) => t.team_id)} />
      {permissions.canWrite && <AddTeams currentTeamIds={teams.map((t) => t.team_id)} />}
    </div>
  );
};

export default ScenarioTeams;
