import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useContext } from 'react';

import ScenarioField from '../../../../components/fields/ScenarioField';
import SimulationField from '../../../../components/fields/SimulationField';
import { CustomDashboardContext } from './CustomDashboardContext';

const CustomDashboardParameters: FunctionComponent = () => {
  const theme = useTheme();
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 300px))',
      gap: theme.spacing(2),
    }}
    >
      {(customDashboard?.custom_dashboard_parameters ?? []).map((p) => {
        switch (p.custom_dashboards_parameter_type) {
          case 'scenario':
            return (
              <div key={p.custom_dashboards_parameter_id}>
                <ScenarioField
                  label={p.custom_dashboards_parameter_name}
                  value={getParameterValue(p.custom_dashboards_parameter_id)}
                  onChange={(value: string | undefined) =>
                    handleParameters(p.custom_dashboards_parameter_id, value ?? '')}
                />
              </div>
            );
          case 'simulation':
            return (
              <div key={p.custom_dashboards_parameter_id}>
                <SimulationField
                  label={p.custom_dashboards_parameter_name}
                  value={getParameterValue(p.custom_dashboards_parameter_id)}
                  onChange={(value: string | undefined) =>
                    handleParameters(p.custom_dashboards_parameter_id, value ?? '')}
                />
              </div>
            );
          default:
            return (<></>);
        }
      })}
    </div>
  );
};

export default CustomDashboardParameters;
