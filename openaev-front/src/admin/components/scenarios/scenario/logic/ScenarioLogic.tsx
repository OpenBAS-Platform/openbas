import { useContext } from 'react';
import { useParams } from 'react-router';

import { type ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import { useHelper } from '../../../../../store';
import type { Scenario } from '../../../../../utils/api-types';
import { scenarioKey } from '../../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../../utils/utils';
import Logic from '../../../chaining/logic/Logic';
import { PermissionsContext } from '../../../common/Context';

const ScenarioLogic = ({ readOnly = false }: { readOnly?: boolean }) => {
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };
  const { scenario } = useHelper((helper: ScenariosHelper) => ({ scenario: helper.getScenario(scenarioId) }));
  const { permissions } = useContext(PermissionsContext);
  // With live updates on, the logic map is read by a query under the scenario key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  // Scenario logic maps are never frozen: they are isolated per run by the copy performed at
  // launch (see ADR-005). They are read-only for an autonomous run (readOnly prop) or for a user
  // without the manage permission, in which case we just hide the edit actions without a banner.
  return (
    <Logic
      workflowId={scenario?.scenario_workflow_id}
      context="scenario"
      scenarioId={scenarioId}
      readOnly={readOnly || !permissions.canManage}
      queryKey={liveUpdates ? scenarioKey(scenarioId) : undefined}
    />
  );
};

export default ScenarioLogic;
