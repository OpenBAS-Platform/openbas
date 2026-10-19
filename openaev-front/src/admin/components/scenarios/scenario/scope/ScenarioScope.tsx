import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import type { WorkflowConfigurationHelper } from '../../../../../actions/chaining/workflow-helper';
import { searchScenarioHealthcheks } from '../../../../../actions/scenarios/scenario-actions';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import { useHelper } from '../../../../../store';
import { type HealthCheck, type Scenario } from '../../../../../utils/api-types';
import { scenarioKey } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';
import { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../../utils/query/useNotifiedQuery';
import { isFeatureEnabled } from '../../../../../utils/utils';
import ScopeDefinition from '../../../chaining/ScopeDefinition';
import { PermissionsContext } from '../../../common/Context';
import Healthchecks from '../../../common/healthchecks/Healthchecks';

interface Props {
  /** Read-only inspection mode: the scope belongs to an autonomous (AI-driven) run. */
  readOnly?: boolean;
  /** OpenAEV-owned autonomous session timeout in seconds, shown instead of the chaining timeout. */
  autonomousTimeoutSeconds?: number | null;
}

const ScenarioScope = ({ readOnly = false, autonomousTimeoutSeconds }: Props) => {
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };

  const { scenario } = useHelper((helper: ScenariosHelper) => ({ scenario: helper.getScenario(scenarioId) }));
  const { workflowConfiguration } = useHelper(
    (helper: WorkflowConfigurationHelper) => ({
      workflowConfiguration: scenario?.scenario_workflow_id
        ? helper.getWorkflowConfiguration(scenario.scenario_workflow_id)
        : undefined,
    }),
  );

  const { permissions } = useContext(PermissionsContext);

  // With live updates on, the healthchecks and the scope are queries under the scenario key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const healthchecksKey = [...scenarioKey(scenarioId), 'healthchecks'];

  const [legacyHealthchecks, setLegacyHealthchecks] = useState<HealthCheck[]>([]);
  useEffect(() => {
    if (!liveUpdates) {
      searchScenarioHealthcheks(scenarioId).then((result: { data: HealthCheck[] }) => setLegacyHealthchecks(result.data));
    }
  }, [scenarioId, scenario, workflowConfiguration]);

  const { data: queriedHealthchecks } = useQuery({
    queryKey: healthchecksKey,
    queryFn: () => searchScenarioHealthcheks(scenarioId).then((result: { data: HealthCheck[] }) => result.data),
    enabled: liveUpdates,
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
    // simpleCall shows its own error toast: no retry, so one toast only.
    retry: false,
  });
  // A local scope edit changes the scenario or its workflow configuration in the store: the
  // healthchecks follow it, as in legacy mode. The first render is the query's own load.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    } else if (liveUpdates) {
      queryClient.invalidateQueries({ queryKey: healthchecksKey });
    }
  }, [scenario, workflowConfiguration]);

  const healthchecks = liveUpdates ? (queriedHealthchecks ?? []) : legacyHealthchecks;

  if (!scenario?.scenario_workflow_id) return null;

  // The empty-scope shortfall is already surfaced in the hero; drop the duplicate inline banner.
  const visibleHealthchecks = healthchecks.filter(healthcheck => healthcheck.type !== 'SCOPE_DEFINITION');

  // Read-only for an autonomous run (readOnly prop) or for a user without the manage permission.
  // Scenario scopes are never frozen, so no read-only banner is shown: we just hide the actions.
  const isReadOnly = readOnly || !permissions.canManage;

  return (
    <div>
      {!!visibleHealthchecks.length && (
        <Healthchecks
          healthchecks={visibleHealthchecks}
          scenarioId={scenarioId}
        />
      )}
      <ScopeDefinition
        workflowId={scenario.scenario_workflow_id}
        readOnly={isReadOnly}
        autonomous={readOnly}
        autonomousTimeoutSeconds={autonomousTimeoutSeconds}
        queryKey={liveUpdates ? scenarioKey(scenarioId) : undefined}
      />
    </div>
  );
};

export default ScenarioScope;
