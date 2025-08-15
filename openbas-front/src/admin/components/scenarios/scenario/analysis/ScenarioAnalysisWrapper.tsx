import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocalStorage } from 'usehooks-ts';

import { type CustomDashboard, type Scenario } from '../../../../../utils/api-types';
import { CustomDashboardContext, type ParameterOption } from '../../../workspaces/custom_dashboards/CustomDashboardContext';
import ScenarioAnalysis from './ScenarioAnalysis';

const ScenarioAnalysisWrapper = () => {
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };
  const [customDashboardValue, setCustomDashboardValue] = useState<CustomDashboard>();
  const [parameters, setParameters] = useLocalStorage<Record<string, ParameterOption>>('custom-dashboard-simulation-' + scenarioId, Object.fromEntries(new Map()));
  const contextValue = useMemo(() => ({
    customDashboard: customDashboardValue,
    setCustomDashboard: setCustomDashboardValue,
    customDashboardParameters: parameters,
    setCustomDashboardParameters: setParameters,
  }), [customDashboardValue, setCustomDashboardValue, parameters, setParameters]);
  return (
    <CustomDashboardContext.Provider value={contextValue}>
      <ScenarioAnalysis />
    </CustomDashboardContext.Provider>
  );
};

export default ScenarioAnalysisWrapper;
