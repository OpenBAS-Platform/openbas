import { type FunctionComponent, useContext } from 'react';

import SimulationField from '../../../../components/fields/SimulationField';
import { type CustomDashboardParameters as CustomDashboardParametersType } from '../../../../utils/api-types';
import { CustomDashboardContext } from './CustomDashboardContext';
import TimeRangeFilters from './TimeRangeFilters';

const CustomDashboardParameters: FunctionComponent = () => {
  const { customDashboard, customDashboardParameters, setCustomDashboardParameters } = useContext(CustomDashboardContext);

  const getParameterValue = (parameterId: string | undefined) => {
    if (!customDashboard) return undefined;
    if (parameterId) {
      return customDashboardParameters[parameterId];
    } else {
      return undefined;
    }
  };
  const handleParameters = (parameterId: string | undefined, value: string) => {
    if (!customDashboard) return;
    if (parameterId) {
      setCustomDashboardParameters(prev => ({
        ...prev,
        [parameterId]: value,
      }));
    }
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
        timeRangeValue={getParameterValue(dateParameters.find(p => p.custom_dashboards_parameter_type === 'timeRange')?.custom_dashboards_parameter_id)}
        handleTimeRange={(data) => {
          handleParameters(dateParameters.find(p => p.custom_dashboards_parameter_type === 'timeRange')?.custom_dashboards_parameter_id, data);
        }}
        startDateValue={getParameterValue(dateParameters.find(p => p.custom_dashboards_parameter_type === 'startDate')?.custom_dashboards_parameter_id)}
        handleStartDate={(data) => {
          handleParameters(dateParameters.find(p => p.custom_dashboards_parameter_type === 'startDate')?.custom_dashboards_parameter_id, data);
        }}
        endDateValue={getParameterValue(dateParameters.find(p => p.custom_dashboards_parameter_type === 'endDate')?.custom_dashboards_parameter_id)}
        handleEndDate={(data) => {
          handleParameters(dateParameters.find(p => p.custom_dashboards_parameter_type === 'endDate')?.custom_dashboards_parameter_id, data);
        }}
      />

    </>
  );
};

export default CustomDashboardParameters;
