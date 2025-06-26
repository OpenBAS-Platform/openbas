import { MenuItem, Select } from '@mui/material';
import { useState } from 'react';

import { customDashboards } from '../../../../../actions/custom_dashboards/customdashboard-action';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { type CustomDashboardOutput } from '../../../../../utils/api-types';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';

const SimulationAnalysis = () => {
  // const dispatch = useAppDispatch();
  // Fetching data
  // const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const { t } = useFormatter();
  const [customDashboardValues, setCustomDashboardValues] = useState<CustomDashboardOutput[]>();
  const [loading, setLoading] = useState(true);

  useDataLoader(() => {
    customDashboards().then((response) => {
      if (response.data) {
        setCustomDashboardValues(response.data);
        setLoading(false);
      }
    });
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Select
      // value={cus} TODO come from exercise_custom_dashboard
        labelId="simulation_custom_dashboard"
        id="simulation_custom_dashboard"
        label={t('Custom dashboards')}
        // onChange={} TODO refresh, save and get custom dashboard
        disabled={false}
        fullWidth
      >
        <MenuItem key="-">-</MenuItem>
        {customDashboardValues?.map(customDashboardValue => (
          <MenuItem key={customDashboardValue.custom_dashboard_id}>{customDashboardValue.custom_dashboard_name}</MenuItem>
        ))}
      </Select>
    </>
  // TODO with read only (customDashboardSelected && <CustomDashboard customDashboard={undefined} />)
  );
};

export default SimulationAnalysis;
