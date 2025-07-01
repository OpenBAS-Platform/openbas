import { InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useContext, useState } from 'react';
import { useParams } from 'react-router';

import { customDashboards } from '../../../../../actions/custom_dashboards/customdashboard-action';
import { updateCustomDashboard } from '../../../../../actions/exercises/exercise-action';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { useHelper } from '../../../../../store';
import { type CustomDashboardOutput, type Exercise } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import CustomDashboardComponent from '../../../workspaces/custom_dashboards/CustomDashboard';
import { CustomDashboardContext } from '../../../workspaces/custom_dashboards/CustomDashboardContext';

const SimulationAnalysis = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const { t } = useFormatter();
  const [customDashboardValues, setCustomDashboardValues] = useState<CustomDashboardOutput[]>();
  const [loading, setLoading] = useState(true);
  const exercise = useHelper((helper: ExercisesHelper) => {
    return helper.getExercise(exerciseId);
  });
  const [customDashboardIdValue, setCustomDashboardIdValue] = useState<string>(exercise.exercise_custom_dashboard ?? '-');

  const { customDashboard, setCustomDashboard, fetchCustomDashboard } = useContext(CustomDashboardContext);

  function fetchCustomDashboardFromId(customDashboardId: string) {
    if (customDashboardId != '-') {
      fetchCustomDashboard(customDashboardId).then((response) => {
        if (response.data) {
          setCustomDashboard(response.data);
          setLoading(false);
        }
      });
    } else {
      setCustomDashboard(undefined);
      setLoading(false);
    }
  }

  useDataLoader(() => {
    customDashboards().then((response) => {
      if (response.data) {
        setCustomDashboardValues(response.data);
        fetchCustomDashboardFromId(customDashboardIdValue);
      }
    });
  });

  function handleOnChange(event: SelectChangeEvent) {
    setLoading(true);
    // Set new value in select
    setCustomDashboardIdValue(event.target.value);
    // Update scenario with custom dashboard id
    dispatch(updateCustomDashboard(exercise.exercise_id, event.target.value));
    // Get custom dashboard from new id to show
    fetchCustomDashboardFromId(event.target.value);
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <InputLabel id="dashboard">{t('Dashboard')}</InputLabel>
      <Select
        value={customDashboardIdValue}
        labelId="simulation_custom_dashboard"
        id="simulation_custom_dashboard"
        label={t('Custom dashboards')}
        onChange={handleOnChange}
        style={{ fontSize: 22 }}
      >
        <MenuItem key="-" value="-">-</MenuItem>
        {customDashboardValues?.map(customDashboardValue => (
          <MenuItem
            key={customDashboardValue.custom_dashboard_id}
            value={customDashboardValue.custom_dashboard_id}
          >
            {customDashboardValue.custom_dashboard_name}
          </MenuItem>
        ))}
      </Select>
      <>
        <div style={{ paddingBottom: theme.spacing(3) }}></div>
        {customDashboard && <CustomDashboardComponent readOnly />}
      </>
    </>
  );
};

export default SimulationAnalysis;
