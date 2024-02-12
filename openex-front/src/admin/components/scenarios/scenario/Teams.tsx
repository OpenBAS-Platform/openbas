import { useParams } from 'react-router-dom';
import React from 'react';
import { makeStyles } from '@mui/styles';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../utils/hooks';
import { addScenarioTeams, fetchScenarioTeams } from '../../../../actions/scenarios/scenario-actions';
import DefinitionMenu from '../../../../components/DefinitionMenu';
import AddTeams from '../../../../components/AddTeams';
import { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useScenarioPermissions from '../../../../utils/Scenario';
import { Scenario, Team } from '../../../../utils/api-types';
import type { Theme } from '../../../../components/Theme';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

const Teams = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };
  console.log('scenarioId', scenarioId);
  const { scenario, teams }: { scenario: Scenario, teams: Team[] } = useHelper((helper: ScenariosHelper) => ({
    scenario: helper.getScenario(scenarioId),
    teams: helper.getScenarioTeams(scenarioId),
  }));
  const permissions = useScenarioPermissions(scenarioId);

  useDataLoader(() => {
    dispatch(fetchScenarioTeams(scenarioId));
  });

  const onAddTeams = (teamIds: Team['team_id'][]) => {
    dispatch(addScenarioTeams(scenarioId, teamIds));
  };

  return (
    <div className={classes.container}>
      <DefinitionMenu base="/admin/scenarios" id={scenarioId} />

      {permissions.canWrite && scenarioId && <AddTeams currentTeamIds={teams.map((t) => t.team_id)} onAddTeams={onAddTeams} />}
    </div>

  );
};

export default Teams;
