import { type FunctionComponent, useContext } from 'react';

import SimulationField from '../../../../components/fields/SimulationField';
import { CustomDashboardContext } from './CustomDashboardContext';

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

  return (
    <>
      {(customDashboard?.custom_dashboard_parameters ?? []).map((p) => {
        if (p.custom_dashboards_parameter_type === 'simulation') {
          return (
            <div key={p.custom_dashboards_parameter_id} style={{ width: 250 }}>
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
    </>
  );
};

export default CustomDashboardParameters;
