import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocalStorage } from 'usehooks-ts';

import {
  attackPathsByScenario,
  countByScenario,
  entitiesByScenario,
  seriesByScenario,
} from '../../../../../actions/scenarios/scenario-actions';
import { type CustomDashboard, type Scenario } from '../../../../../utils/api-types';
import {
  CustomDashboardContext,
  type CustomDashboardContextType,
  type ParameterOption,
} from '../../../workspaces/custom_dashboards/CustomDashboardContext';
import ScenarioAnalysis from './ScenarioAnalysis';

const ScenarioAnalysisWrapper = () => {
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };
  const [customDashboardValue, setCustomDashboardValue] = useState<CustomDashboard>();
  const [parameters, setParameters] = useLocalStorage<Record<string, ParameterOption>>('custom-dashboard-scenario-' + scenarioId, Object.fromEntries(new Map()));
  const contextValue: CustomDashboardContextType = useMemo(() => ({
    customDashboard: customDashboardValue,
    setCustomDashboard: setCustomDashboardValue,
    customDashboardParameters: parameters,
    setCustomDashboardParameters: setParameters,
    fetchCount: (widgetId, params) => countByScenario(scenarioId, widgetId, params),
    fetchSeries: (widgetId, params) => seriesByScenario(scenarioId, widgetId, params),
    fetchEntities: (widgetId, params) => entitiesByScenario(scenarioId, widgetId, params),
    fetchAttackPaths: (widgetId, params) => attackPathsByScenario(scenarioId, widgetId, params),
  }), [customDashboardValue, setCustomDashboardValue, parameters, setParameters]);
  return (
    <CustomDashboardContext.Provider value={contextValue}>
      <ScenarioAnalysis />
    </CustomDashboardContext.Provider>
  );
};

export default ScenarioAnalysisWrapper;
