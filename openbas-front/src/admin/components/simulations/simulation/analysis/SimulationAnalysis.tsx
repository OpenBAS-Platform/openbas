import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { fetchExercise } from '../../../../../actions/Exercise';
import { fetchCustomDashboardFromSimulation } from '../../../../../actions/exercises/exercise-action';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import Loader from '../../../../../components/Loader';
import { useHelper } from '../../../../../store';
import { type Exercise } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import CustomDashboardComponent from '../../../workspaces/custom_dashboards/CustomDashboard';
import { CustomDashboardContext, type ParameterOption } from '../../../workspaces/custom_dashboards/CustomDashboardContext';
import { ALL_TIME_TIME_RANGE } from '../../../workspaces/custom_dashboards/widgets/configuration/common/TimeRangeUtils';

const SimulationAnalysis = () => {
  const dispatch = useAppDispatch();
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const [loading, setLoading] = useState(true);
  const exercise = useHelper((helper: ExercisesHelper) => {
    return helper.getExercise(exerciseId);
  });
  useDataLoader(() => {
    dispatch(fetchExercise(exerciseId));
  });

  const { customDashboard, setCustomDashboard, setCustomDashboardParameters } = useContext(CustomDashboardContext);

  useEffect(() => {
    if (exercise.exercise_custom_dashboard != '-') {
      fetchCustomDashboardFromSimulation(exercise.exercise_id).then((response) => {
        if (response.data) {
          const dashboard = response.data;
          setCustomDashboard(dashboard);

          const params: Record<string, ParameterOption> = {};
          dashboard.custom_dashboard_parameters?.forEach((p: {
            custom_dashboards_parameter_type: string;
            custom_dashboards_parameter_id: string;
          }) => {
            if ('simulation' === p.custom_dashboards_parameter_type) {
              params[p.custom_dashboards_parameter_id] = {
                value: exerciseId,
                hidden: true,
              };
            } else if ('scenario' === p.custom_dashboards_parameter_type) {
              params[p.custom_dashboards_parameter_id] = {
                value: exercise.exercise_scenario ?? '',
                hidden: true,
              };
            } else {
              params[p.custom_dashboards_parameter_id] = {
                value: p.custom_dashboards_parameter_id,
                hidden: false,
              };
            }
            if ('timeRange' === p.custom_dashboards_parameter_type) {
              params[p.custom_dashboards_parameter_id].value = ALL_TIME_TIME_RANGE;
            }
          });
          setCustomDashboardParameters(params);

          setLoading(false);
        }
      });
    } else {
      setCustomDashboard(undefined);
      setLoading(false);
    }
  }, [exercise]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {customDashboard && <CustomDashboardComponent readOnly />}
    </>
  );
};

export default SimulationAnalysis;
