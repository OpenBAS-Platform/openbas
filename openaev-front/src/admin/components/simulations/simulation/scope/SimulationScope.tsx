import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import type { WorkflowConfigurationHelper } from '../../../../../actions/chaining/workflow-helper';
import { searchExerciseHealthchecks } from '../../../../../actions/Exercise';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import { useHelper } from '../../../../../store';
import { type Exercise, type HealthCheck } from '../../../../../utils/api-types';
import useSimulationPermissions from '../../../../../utils/permissions/useSimulationPermissions';
import { simulationKey } from '../../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../../utils/utils';
import ScopeDefinition from '../../../chaining/ScopeDefinition';
import Healthchecks from '../../../common/healthchecks/Healthchecks';
import { simulationHealthchecksKey, useSimulationHealthchecks } from '../simulationQueries';

interface Props {
  /** Read-only inspection mode: the scope belongs to an autonomous (AI-driven) run. */
  readOnly?: boolean;
  /** OpenAEV-owned autonomous session timeout in seconds, shown instead of the chaining timeout. */
  autonomousTimeoutSeconds?: number | null;
}

const SimulationScope = ({ readOnly = false, autonomousTimeoutSeconds }: Props) => {
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };

  const { exercise } = useHelper((helper: ExercisesHelper) => ({ exercise: helper.getExercise(exerciseId) }));
  const permissions = useSimulationPermissions(exerciseId, exercise);
  const { workflowConfiguration } = useHelper(
    (helper: WorkflowConfigurationHelper) => ({
      workflowConfiguration: exercise?.exercise_workflow_id
        ? helper.getWorkflowConfiguration(exercise.exercise_workflow_id)
        : undefined,
    }),
  );

  // With live updates on, the healthchecks and the scope are queries under the simulation key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const queryClient = useQueryClient();

  const [legacyHealthchecks, setLegacyHealthchecks] = useState<HealthCheck[]>([]);
  useEffect(() => {
    if (!liveUpdates && exercise?.exercise_workflow_id) {
      searchExerciseHealthchecks(exerciseId).then((result: { data: HealthCheck[] }) => setLegacyHealthchecks(result.data));
    }
  }, [exerciseId, exercise, workflowConfiguration]);

  // Shared with the header: one fetch for both.
  const { data: queriedHealthchecks } = useSimulationHealthchecks(exerciseId, liveUpdates && !!exercise?.exercise_workflow_id);
  // A local scope edit changes the simulation or its workflow configuration in the store: the
  // healthchecks follow it, as in legacy mode. The first render is the query's own load.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    } else if (liveUpdates) {
      queryClient.invalidateQueries({ queryKey: simulationHealthchecksKey(exerciseId) });
    }
  }, [exercise, workflowConfiguration]);

  const healthchecks = liveUpdates ? (queriedHealthchecks ?? []) : legacyHealthchecks;

  if (!exercise?.exercise_workflow_id) return null;

  // The empty-scope shortfall is already surfaced in the hero; drop the duplicate inline banner.
  const visibleHealthchecks = healthchecks.filter(healthcheck => healthcheck.type !== 'SCOPE_DEFINITION');

  // Read-only for two independent reasons: an autonomous run (router-provided) OR a launched
  // simulation - the scope is editable only while SCHEDULED (see ADR-005).
  const launched = exercise.exercise_status !== 'SCHEDULED';
  const effectiveReadOnly = readOnly || launched || !permissions.canManage;

  return (
    <div>
      {!!visibleHealthchecks.length && (
        <Healthchecks
          healthchecks={visibleHealthchecks}
          exerciseId={exerciseId}
        />
      )}
      <ScopeDefinition
        workflowId={exercise.exercise_workflow_id}
        readOnly={effectiveReadOnly}
        autonomous={readOnly}
        autonomousTimeoutSeconds={autonomousTimeoutSeconds}
        queryKey={liveUpdates ? simulationKey(exerciseId) : undefined}
      />
    </div>
  );
};

export default SimulationScope;
