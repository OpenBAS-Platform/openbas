import { useContext } from 'react';
import { useParams } from 'react-router';

import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import { useHelper } from '../../../../../store';
import { type Scenario } from '../../../../../utils/api-types';
import ScopeDefinition from '../../../chaining/ScopeDefinition';
import { PermissionsContext } from '../../../common/Context';
import Healthchecks from '../../../common/healthchecks/Healthchecks';
import { useReadinessContext } from '../../../common/healthchecks/readiness';

interface Props {
  /** Read-only inspection mode: the scope belongs to an autonomous (AI-driven) run. */
  readOnly?: boolean;
  /** OpenAEV-owned autonomous session timeout in seconds, shown instead of the chaining timeout. */
  autonomousTimeoutSeconds?: number | null;
}

const ScenarioScope = ({ readOnly = false, autonomousTimeoutSeconds }: Props) => {
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };

  const { scenario } = useHelper((helper: ScenariosHelper) => ({ scenario: helper.getScenario(scenarioId) }));

  const { permissions } = useContext(PermissionsContext);

  const { healthchecks } = useReadinessContext();

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
      />
    </div>
  );
};

export default ScenarioScope;
