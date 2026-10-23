import { useCallback } from 'react';

import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import { fetchScenarioExpectationsDrift, searchScenarioHealthcheks } from '../../../../actions/scenarios/scenario-actions';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import { fetchScenarioInjectsSimple } from '../../../../actions/scenarios/scenario-inject-actions';
import { useHelper } from '../../../../store';
import type { Scenario } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import { useReadiness } from '../../common/healthchecks/readiness';

const useScenarioReadiness = (scenarioId: Scenario['scenario_id']) => {
  const dispatch = useAppDispatch();
  const { scenario, injects } = useHelper((helper: ScenariosHelper & InjectHelper) => ({
    scenario: helper.getScenario(scenarioId),
    injects: helper.getScenarioInjects(scenarioId),
  }));
  const loadInjects = useCallback(() => dispatch(fetchScenarioInjectsSimple(scenarioId)), [dispatch, scenarioId]);
  return useReadiness({
    id: scenarioId,
    updatedAt: scenario?.scenario_updated_at,
    injects,
    workflowId: scenario?.scenario_workflow_id,
    loadInjects,
    fetchHealthchecks: searchScenarioHealthcheks,
    fetchExpectationsDrift: fetchScenarioExpectationsDrift,
  });
};

export default useScenarioReadiness;
