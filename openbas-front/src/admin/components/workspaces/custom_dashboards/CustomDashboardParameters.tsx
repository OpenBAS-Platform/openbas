import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useContext } from 'react';

import ScenarioField from '../../../../components/fields/ScenarioField';
import SimulationField from '../../../../components/fields/SimulationField';
import { type CustomDashboardParameters as CustomDashboardParametersType } from '../../../../utils/api-types';
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

  const renderParameterField = (p: CustomDashboardParametersType) => {
    switch (p.custom_dashboards_parameter_type) {
      case 'scenario':
        return (
          <ScenarioField
            label={p.custom_dashboards_parameter_name}
            value={getParameterValue(p.custom_dashboards_parameter_id)}
            onChange={(value: string | undefined) =>
              handleParameters(p.custom_dashboards_parameter_id, value ?? '')}
          />
        );
      case 'simulation':
        return (
          <SimulationField
            label={p.custom_dashboards_parameter_name}
            value={getParameterValue(p.custom_dashboards_parameter_id)}
            onChange={(value: string | undefined) =>
              handleParameters(p.custom_dashboards_parameter_id, value ?? '')}
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
    </div>
  );
};

export default CustomDashboardParameters;
