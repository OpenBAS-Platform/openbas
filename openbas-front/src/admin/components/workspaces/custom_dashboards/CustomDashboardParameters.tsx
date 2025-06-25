import { type FunctionComponent, useEffect, useState } from 'react';

import { getParameters, updateParameters } from '../../../../actions/dashboards/dashboard-action';
import SimulationField from '../../../../components/fields/SimulationField';
import { type CustomDashboard, type DashboardParameters, DashboardParametersInput } from '../../../../utils/api-types';

interface Props {
  customDashboard: CustomDashboard;
}

const CustomDashboardParameters: FunctionComponent<Props> = ({ customDashboard }) => {
  const [parameters, setParameters] = useState<DashboardParameters[]>([]);

  useEffect(() => {
    getParameters().then(res => setParameters(res.data));
  }, []);

  const handleParameters = (id: string, value: string | undefined) => {
    const input: DashboardParametersInput = {
      parameters_id: id,
      parameters_value: value,
    };
    updateParameters(customDashboard.custom_dashboard_id, input);
  };

  return (
    <>
      {parameters.map((p) => {
        if (p.parameters_type === 'simulation') {
          return (
            <div key={p.parameters_id} style={{ width: 150 }}>
              <SimulationField
                value={customDashboard.custom_dashboard_parameters?.[p.parameters_id]}
                onChange={(value: string | undefined) => handleParameters(p.parameters_id, value)}
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
