import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useContext } from 'react';

import ScenarioField from '../../../../components/fields/ScenarioField';
import SimulationField from '../../../../components/fields/SimulationField';
import { type CustomDashboardParameters as CustomDashboardParametersType } from '../../../../utils/api-types';
import { CustomDashboardContext } from './CustomDashboardContext';
import TimeRangeFilters from './TimeRangeFilters';
import { LAST_QUARTER_TIME_RANGE } from './widgets/configuration/common/TimeRangeUtils';

const CustomDashboardParameters: FunctionComponent = () => {
  const theme = useTheme();
  const { customDashboard, customDashboardParameters, setCustomDashboardParameters } = useContext(CustomDashboardContext);

  const getParameter = (parameterId: string | undefined) => {
    if (!customDashboard) return undefined;
    if (parameterId) {
      return customDashboardParameters[parameterId];
    } else {
      return undefined;
    }
  };
  const handleParametersValue = (parameterId: string | undefined, value: string) => {
    if (!customDashboard) return;
    if (parameterId) {
      setCustomDashboardParameters((prev) => {
      return {
        ...prev,
        [parameterId]: {
          ...prev[parameterId],value,
      },
      };
    });
    }
  };

  const dateParameters: Map<CustomDashboardParametersType['custom_dashboards_parameter_type'], string> = new Map();
  customDashboard?.custom_dashboard_parameters?.forEach((p) => {
    if (['timeRange', 'startDate', 'endDate'].includes(p.custom_dashboards_parameter_type)) {
      dateParameters.set(p.custom_dashboards_parameter_type, p.custom_dashboards_parameter_id);
    }
  });

  const renderParameterField = (p: CustomDashboardParametersType) => {
    const param = getParameter(p.custom_dashboards_parameter_id);
    if (param?.hidden) {
      return null;
    }
    switch (p.custom_dashboards_parameter_type) {
      case 'scenario':
        return (
          <ScenarioField
            label={p.custom_dashboards_parameter_name}
            value={param?.value}
            onChange={(value: string | undefined) =>
              handleParametersValue(p.custom_dashboards_parameter_id, value ?? '')}
          />
        );
      case 'simulation':
        return (
          <SimulationField
            label={p.custom_dashboards_parameter_name}
            value={param?.value}
            onChange={(value: string | undefined) =>
              handleParametersValue(p.custom_dashboards_parameter_id, value ?? '')}
            searchOptionsConfig={param?.searchOptionsConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <TimeRangeFilters
        timeRangeValue={getParameterValue(dateParameters.get('timeRange')) ?? LAST_QUARTER_TIME_RANGE}
        handleTimeRange={data => handleParameters(dateParameters.get('timeRange'), data)}
        startDateValue={getParameterValue(dateParameters.get('startDate'))}
        handleStartDate={data => handleParameters(dateParameters.get('startDate'), data)}
        endDateValue={getParameterValue(dateParameters.get('endDate'))}
        handleEndDate={data => handleParameters(dateParameters.get('endDate'), data)}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 300px))',
          gap: theme.spacing(2),
        }}
      >
        {(customDashboard?.custom_dashboard_parameters ?? []).map(p => renderParameterField(p))}
      </div>
    </>

  );
};

export default CustomDashboardParameters;
