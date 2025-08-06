import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useContext } from 'react';

import ScenarioField from '../../../../components/fields/ScenarioField';
import SimulationField from '../../../../components/fields/SimulationField';
import { type CustomDashboardParameters as CustomDashboardParametersType } from '../../../../utils/api-types';
import { CustomDashboardContext } from './CustomDashboardContext';
import TimeRangeFilters from './TimeRangeFilters';

const CustomDashboardParameters: FunctionComponent = () => {
  const theme = useTheme();
  const { customDashboard, customDashboardParameters, setCustomDashboardParameters } = useContext(CustomDashboardContext);

  const getParameter = (parameterId: string) => {
    if (!customDashboard) return undefined;
    return customDashboardParameters[parameterId];
  };
  const handleParametersValue = (parameterId: string, value: string) => {
    if (!customDashboard) return;
    setCustomDashboardParameters((prev) => {
      return {
        ...prev,
        [parameterId]: {
          ...prev[parameterId],
          value,
        },
      };
    });
  };

  const dateParameters: CustomDashboardParametersType[] = [];
  customDashboard?.custom_dashboard_parameters?.forEach((p) => {
    if (['timeRange', 'startDate', 'endDate'].includes(p.custom_dashboards_parameter_type)) {
      dateParameters.push(p);
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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 300px))',
        gap: theme.spacing(2),
      }}
    >
      {(customDashboard?.custom_dashboard_parameters ?? []).map(p => (
        <div key={p.custom_dashboards_parameter_id}>
          {renderParameterField(p)}
        </div>
      ))}
      <TimeRangeFilters
        defaultTimeRange={getParameterValue(dateParameters.find(p => p.custom_dashboards_parameter_type === 'timeRange')?.custom_dashboards_parameter_id)}
        handleTimeRange={(data) => {
          handleParameters(dateParameters.find(p => p.custom_dashboards_parameter_type === 'timeRange')?.custom_dashboards_parameter_id, data);
        }}
        defaultStartDate={getParameterValue(dateParameters.find(p => p.custom_dashboards_parameter_type === 'startDate')?.custom_dashboards_parameter_id)}
        handleStartDate={(data) => {
          handleParameters(dateParameters.find(p => p.custom_dashboards_parameter_type === 'startDate')?.custom_dashboards_parameter_id, data);
        }}
        defaultEndDate={getParameterValue(dateParameters.find(p => p.custom_dashboards_parameter_type === 'endDate')?.custom_dashboards_parameter_id)}
        handleEndDate={(data) => {
          handleParameters(dateParameters.find(p => p.custom_dashboards_parameter_type === 'endDate')?.custom_dashboards_parameter_id, data);
        }}
      />
    </div>
  );
};

export default CustomDashboardParameters;
