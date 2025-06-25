import { type FunctionComponent, useContext } from 'react';

import { updateCustomDashboardParameter } from '../../../../actions/custom_dashboards/customdashboard-action';
import SimulationField from '../../../../components/fields/SimulationField';
import { CustomDashboardContext } from './CustomDashboardContext';

const CustomDashboardParameters: FunctionComponent = () => {
  const { customDashboard, setCustomDashboard } = useContext(CustomDashboardContext);
  const handleParameters = (parameterId: string, value: string | undefined) => {
    if (!customDashboard) return;
    updateCustomDashboardParameter(customDashboard.custom_dashboard_id, parameterId, { custom_dashboards_parameter_value: value })
      .then(res => setCustomDashboard(res.data));
  };

  return (
    <>
      {(customDashboard?.custom_dashboard_parameters ?? []).map((p) => {
        if (p.custom_dashboards_parameter_type === 'simulation') {
          return (
            <div key={p.custom_dashboards_parameter_id} style={{ width: 250 }}>
              <SimulationField
                label={p.custom_dashboards_parameter_name}
                value={p.custom_dashboards_parameter_value}
                onChange={(value: string | undefined) => handleParameters(p.custom_dashboards_parameter_id, value)}
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
