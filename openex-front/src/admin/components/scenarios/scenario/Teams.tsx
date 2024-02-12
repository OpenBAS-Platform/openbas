import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import React from 'react';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchExerciseTeams } from '../../../../actions/Exercise';
import { useAppDispatch } from '../../../../utils/hooks';
import { fetchScenarioTeams } from '../../../../actions/scenarios/scenario-actions';
import ExerciseAddTeams from '../../exercises/teams/ExerciseAddTeams';
import DefinitionMenu from '../../../../components/DefinitionMenu';
import { TechnicalScenarioSimulationEnum } from '../../../../utils/technical';
import type { ScenariosHelper } from '../../../../actions/helper';

const Teams = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { scenarioId } = useParams();
  const { scenario, teams } = useHelper((helper: ScenariosHelper) => ({
    scenario: helper.getScenario(scenarioId),
    teams: helper.getScenarioTeams(scenarioId),
  }));

  useDataLoader(() => {
    dispatch(fetchScenarioTeams(scenarioId));
  });

  return (
    <div className={classes.container}>
      <DefinitionMenu type={TechnicalScenarioSimulationEnum.Scenario} scenarioId={scenarioId} />

      {permissions.canWrite && <AddTeams scenarioId={scenarioId} scenarioTeamsIds={teams.map((team) => team.team_id)} />}
    </div>

  );
};

export default Teams;
