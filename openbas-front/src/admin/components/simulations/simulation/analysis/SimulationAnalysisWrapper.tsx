import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocalStorage } from 'usehooks-ts';

import { type CustomDashboard, type Exercise } from '../../../../../utils/api-types';
import { CustomDashboardContext, type CustomDashboardContextType, type ParameterOption } from '../../../workspaces/custom_dashboards/CustomDashboardContext';
import SimulationAnalysis from './SimulationAnalysis';

const SimulationAnalysisWrapper = () => {
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const [customDashboardValue, setCustomDashboardValue] = useState<CustomDashboard>();
  const [parameters, setParameters] = useLocalStorage<Record<string, ParameterOption>>('custom-dashboard-simulation-' + exerciseId, Object.fromEntries(new Map()));
  const contextValue: CustomDashboardContextType = useMemo(() => ({
    customDashboard: customDashboardValue,
    setCustomDashboard: setCustomDashboardValue,
    customDashboardParameters: parameters,
    setCustomDashboardParameters: setParameters,
  }), [customDashboardValue, setCustomDashboardValue]);

  return (
    <CustomDashboardContext.Provider value={contextValue}>
      <SimulationAnalysis />
    </CustomDashboardContext.Provider>
  );
};

export default SimulationAnalysisWrapper;
