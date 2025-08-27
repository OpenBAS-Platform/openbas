import { useTheme } from '@mui/material/styles';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { fetchCustomDashboard } from '../../../../../actions/custom_dashboards/customdashboard-action';
import { fetchScenario } from '../../../../../actions/scenarios/scenario-actions';
import { type ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import { SCENARIO_SIMULATIONS } from '../../../../../components/common/queryable/filter/constants';
import Loader from '../../../../../components/Loader';
import { useHelper } from '../../../../../store';
import { type Scenario } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { isNotEmptyField } from '../../../../../utils/utils';
import CustomDashboardComponent from '../../../workspaces/custom_dashboards/CustomDashboard';
import { CustomDashboardContext, type ParameterOption } from '../../../workspaces/custom_dashboards/CustomDashboardContext';
import CustomDashboardParameters from '../../../workspaces/custom_dashboards/CustomDashboardParameters';

const ScenarioAnalysis = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };
  const [loading, setLoading] = useState(true);
  const scenario = useHelper((helper: ScenariosHelper) => {
    return helper.getScenario(scenarioId);
  });
  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
  });

  const { customDashboard, setCustomDashboard, customDashboardParameters, setCustomDashboardParameters } = useContext(CustomDashboardContext);

  useEffect(() => {
    if (isNotEmptyField(scenario.scenario_custom_dashboard)) {
      fetchCustomDashboard(scenario.scenario_custom_dashboard).then((response) => {
        if (response.data) {
          const dashboard = response.data;
          setCustomDashboard(dashboard);

          const params: Record<string, ParameterOption> = {};
          dashboard.custom_dashboard_parameters?.forEach((p: {
            custom_dashboards_parameter_type: string;
            custom_dashboards_parameter_id: string;
          }) => {
            const value = customDashboardParameters[p.custom_dashboards_parameter_id]?.value;
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
          setCustomDashboardParameters(params);

          setLoading(false);
        }
      });
    } else {
      setCustomDashboard(undefined);
      setLoading(false);
    }
  }, [scenario]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{
      display: 'grid',
      gap: theme.spacing(2),
    }}
    >
      <CustomDashboardParameters />
      {customDashboard && <CustomDashboardComponent readOnly />}
    </div>
  );
};

export default ScenarioAnalysis;
