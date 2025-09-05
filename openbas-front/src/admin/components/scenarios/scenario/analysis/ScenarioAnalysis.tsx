import { useContext } from 'react';
import { useParams } from 'react-router';

import { fetchScenario, updateScenario } from '../../../../../actions/scenarios/scenario-actions';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import { SCENARIO_SIMULATIONS } from '../../../../../components/common/queryable/filter/constants';
import { useHelper } from '../../../../../store';
import { type CustomDashboard, type Scenario } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { AbilityContext, Can } from '../../../../../utils/permissions/PermissionsProvider';
import { ACTIONS, SUBJECTS } from '../../../../../utils/permissions/types';
import { type ParameterOption } from '../../../workspaces/custom_dashboards/CustomDashboardContext';
import CustomDashboardWrapper from '../../../workspaces/custom_dashboards/CustomDashboardWrapper';
import NoDashboardComponent from '../../../workspaces/custom_dashboards/NoDashboardComponent';
import SelectDashboardButton from '../../../workspaces/custom_dashboards/SelectDashboardButton';

const ScenarioAnalysis = () => {
  const dispatch = useAppDispatch();
  const ability = useContext(AbilityContext);
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };

  const scenario = useHelper((helper: ScenariosHelper) => {
    return helper.getScenario(scenarioId);
  });
  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
  });
  const handleSelectNewDashboard = (dashboardId: string) => {
    dispatch(updateScenario(scenario.scenario_id, {
      ...scenario,
      scenario_custom_dashboard: dashboardId,
    }));
  };

  const paramsBuilder = (dashboardParameters: CustomDashboard['custom_dashboard_parameters'], localStorageParams: Record<string, ParameterOption>) => {
    const params: Record<string, ParameterOption> = {};
    dashboardParameters?.forEach((p) => {
      const value = localStorageParams[p.custom_dashboards_parameter_id]?.value;
      if ('scenario' === p.custom_dashboards_parameter_type) {
        params[p.custom_dashboards_parameter_id] = {
          value: scenario.scenario_id,
          hidden: true,
        };
      } else if ('simulation' === p.custom_dashboards_parameter_type) {
        params[p.custom_dashboards_parameter_id] = {
          value: value,
          hidden: false,
          searchOptionsConfig: {
            filterKey: SCENARIO_SIMULATIONS,
            contextId: scenarioId,
          },
        };
      } else {
        params[p.custom_dashboards_parameter_id] = {
          value: value,
          hidden: false,
        };
      }
    });
    return params;
  };

  const configuration = {
    customDashboardId: scenario?.scenario_custom_dashboard,
    paramLocalStorageKey: 'custom-dashboard-scenario-' + scenarioId,
    paramsBuilder,
    parentContextId: scenarioId,
    canChooseDashboard: ability.can(ACTIONS.MANAGE, SUBJECTS.RESOURCE, scenarioId),
    handleSelectNewDashboard,
  };

  return (
    <CustomDashboardWrapper
      configuration={configuration}
      noDashboardSlot={(
        <NoDashboardComponent
          actionComponent={(
            <Can I={ACTIONS.MANAGE} a={SUBJECTS.RESOURCE} field={scenarioId}>
              <SelectDashboardButton
                variant="text"
                handleApplyChange={handleSelectNewDashboard}
                scenarioOrSimulationId={scenarioId}
              />
            </Can>
          )}
        />
      )}
    />
  );
};

export default ScenarioAnalysis;
