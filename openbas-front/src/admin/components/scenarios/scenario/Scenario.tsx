import { useParams } from 'react-router-dom';
import React from 'react';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchScenario } from '../../../../actions/scenarios/scenario-actions';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import { fetchExercises } from '../../../../actions/Exercise';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import ExerciseList from '../../simulations/ExerciseList';
import ScenarioDistributionByExercise from './ScenarioDistributionByExercise';

const Scenario = () => {
  // Standard hooks
  const dispatch = useAppDispatch();

  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  // Fetching data
  const { scenario, exercises } = useHelper((helper: ScenariosHelper & ExercisesHelper) => ({
    scenario: helper.getScenario(scenarioId),
    exercises: helper.getExercisesMap(),
  }));

  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
    dispatch(fetchExercises());
  });

  const scenarioExercises = scenario.scenario_exercises?.map((exerciseId: string) => exercises[exerciseId])
    .filter((ex: ExerciseStore) => !!ex);

  return (
    <div style={{ marginTop: 24 }}>
      <ScenarioDistributionByExercise exercises={scenarioExercises}/>
      <ExerciseList exercises={scenarioExercises} />
    </div>
  );
};

export default Scenario;
