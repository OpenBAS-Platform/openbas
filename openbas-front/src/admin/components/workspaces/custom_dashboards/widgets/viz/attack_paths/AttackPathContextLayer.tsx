import { useEffect } from 'react';

import { fetchExercise } from '../../../../../../../actions/Exercise';
import { type ExercisesHelper } from '../../../../../../../actions/exercises/exercise-helper';
import { useHelper } from '../../../../../../../store';
import { type EsAttackPath } from '../../../../../../../utils/api-types';
import type { StructuralHistogramWidget } from '../../../../../../../utils/api-types-custom';
import { useAppDispatch } from '../../../../../../../utils/hooks';
import AttackPath from './AttackPath';

interface Props {
  attackPathsData: EsAttackPath[];
  widgetId: string;
  widgetConfig: StructuralHistogramWidget;
}

const AttackPathContextLayer = ({ attackPathsData, widgetId, widgetConfig }: Props) => {
  const dispatch = useAppDispatch();
  const simulationId = (((widgetConfig.series[0] || []).filter?.filters || []).find(f => f.key == 'base_simulation_side')?.values ?? [])[0];

  const { exercise } = useHelper((helper: ExercisesHelper) => ({ exercise: helper.getExercise(simulationId) }));

  useEffect(() => {
    dispatch(fetchExercise(simulationId));
  }, []);

  return (
    <AttackPath
      data={attackPathsData}
      widgetId={widgetId}
      simulationId={simulationId}
      simulationStartDate={exercise?.exercise_start_date}
      simulationEndDate={exercise?.exercise_end_date}
    />
  );
};

export default AttackPathContextLayer;
