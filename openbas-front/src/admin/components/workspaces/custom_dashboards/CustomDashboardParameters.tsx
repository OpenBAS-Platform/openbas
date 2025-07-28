import { type FunctionComponent, useContext } from 'react';

import SimulationField from '../../../../components/fields/SimulationField';
import { type CustomDashboardParameters as CustomDashboardParametersType } from '../../../../utils/api-types';
import { CustomDashboardContext } from './CustomDashboardContext';
import TimeRangeFilters from './TimeRangeFilters';

const CustomDashboardParameters: FunctionComponent = () => {
  const { customDashboard, customDashboardParameters, setCustomDashboardParameters } = useContext(CustomDashboardContext);

  const getParameterValue = (parameterId: string) => {
    if (!customDashboard) return undefined;
    return customDashboardParameters[parameterId];
  };
  const handleParameters = (parameterId: string, value: string) => {
    if (!customDashboard) return;
    setCustomDashboardParameters(prev => ({
      ...prev,
      [parameterId]: value,
    }));
  };

  const parameters: CustomDashboardParametersType[] = [];
  const dateParameters: CustomDashboardParametersType[] = [];
  customDashboard?.custom_dashboard_parameters?.forEach((p) => {
    if (['timeRange', 'startDate', 'endDate'].includes(p.custom_dashboards_parameter_type)) {
      dateParameters.push(p);
    } else {
      parameters.push(p);
    }
  });

  return (
    <>
      {(parameters ?? []).map((p) => {
        if (p.custom_dashboards_parameter_type === 'simulation') {
          return (
            <div key={p.custom_dashboards_parameter_id} style={{ width: 350 }}>
              <SimulationField
                label={p.custom_dashboards_parameter_name}
                value={getParameterValue(p.custom_dashboards_parameter_id)}
                onChange={(value: string | undefined) => handleParameters(p.custom_dashboards_parameter_id, value ?? '')}
              />
            </div>
          );
        } else {
          return (<></>);
        }
      })}

      <TimeRangeFilters
        defaultTimeRange={getParameterValue(dateParameters.find(p => p.custom_dashboards_parameter_type === 'timeRange')?.custom_dashboards_parameter_id)}
        handleTimeRange={(data) => {
          handleParameters(dateParameters.find(p => p.custom_dashboards_parameter_type === 'timeRange')?.custom_dashboards_parameter_id, data);
        }}
        handleStartDate={(data) => {
          handleParameters(dateParameters.find(p => p.custom_dashboards_parameter_type === 'startDate')?.custom_dashboards_parameter_id, data);
        }}
        handleEndDate={(data) => {
          handleParameters(dateParameters.find(p => p.custom_dashboards_parameter_type === 'endDate')?.custom_dashboards_parameter_id, data);
        }}
      />

    </>
  );
};

export default CustomDashboardParameters;
