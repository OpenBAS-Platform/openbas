import { useParams } from 'react-router-dom';
import React from 'react';
import { makeStyles } from '@mui/styles';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../../utils/hooks';
import { addScenarioTeams, fetchScenarioTeams } from '../../../../../actions/scenarios/scenario-actions';
import DefinitionMenu from '../../../components/DefinitionMenu';
import AddTeams from '../../../components/teams/AddTeams';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import useScenarioPermissions from '../../../../../utils/Scenario';
import type { Theme } from '../../../../../components/Theme';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import type { TeamStore } from '../../../teams/teams/Team';

const useStyles = makeStyles((theme: Theme) => ({
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
  console.log('scenarioId', scenarioId);
  const { scenario, teams }: { scenario: ScenarioStore, teams: TeamStore[] } = useHelper((helper: ScenariosHelper) => ({
    scenario: helper.getScenario(scenarioId),
    teams: helper.getScenarioTeams(scenarioId),
  }));
  const permissions = useScenarioPermissions(scenarioId);

  useDataLoader(() => {
    dispatch(fetchScenarioTeams(scenarioId));
  });

  const onAddTeams = (teamIds: TeamStore['team_id'][]) => {
    dispatch(addScenarioTeams(scenarioId, teamIds));
  };

  return (
    <div className={classes.container}>
      <DefinitionMenu base="/admin/scenarios" id={scenarioId} />

      {permissions.canWrite && scenarioId && <AddTeams currentTeamIds={teams.map((t) => t.team_id)} onAddTeams={onAddTeams} />}
    </div>

  );
};

export default ScenarioTeams;
