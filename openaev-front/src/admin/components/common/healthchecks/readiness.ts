import { createContext, type Dispatch, type SetStateAction, useContext, useEffect, useMemo, useState } from 'react';

import type { AgentHelper } from '../../../../actions/agents/agent-helper';
import type { WorkflowConfigurationHelper } from '../../../../actions/chaining/workflow-helper';
import type { CollectorHelper } from '../../../../actions/collectors/collector-helper';
import type { LoggedHelper } from '../../../../actions/helper';
import { useHelper } from '../../../../store';
import type { Agent, ExpectationsDriftOutput, HealthCheck, Inject } from '../../../../utils/api-types';

interface Readiness {
  healthchecks: HealthCheck[];
  expectationsDrift: ExpectationsDriftOutput | null;
  setExpectationsDrift: Dispatch<SetStateAction<ExpectationsDriftOutput | null>>;
}

const ReadinessContext = createContext<Readiness>({
  healthchecks: [],
  expectationsDrift: null,
  setExpectationsDrift: () => {},
});

export const ReadinessProvider = ReadinessContext.Provider;

export const useReadinessContext = () => useContext(ReadinessContext);

type Fetch<T> = (id: string, notifyOnError: boolean) => Promise<{ data: T }>;

// Absorbs the remaining store steps of a page load (agents, collectors, workflow) into one call.
const SETTLE_DELAY_MS = 500;

interface ReadinessSource {
  id: string;
  updatedAt?: string;
  injects?: Inject[];
  workflowId?: string;
  loadInjects: () => Promise<unknown>;
  fetchHealthchecks: Fetch<HealthCheck[]>;
  fetchExpectationsDrift: Fetch<ExpectationsDriftOutput>;
}

// Both computations are slow on large scenarios and simulations: fetched once per page, after the
// injects are loaded, and again only when an input of the checks really changes.
export const useReadiness = ({
  id,
  updatedAt,
  injects,
  workflowId,
  loadInjects,
  fetchHealthchecks,
  fetchExpectationsDrift,
}: ReadinessSource): Readiness => {
  const { settings, collectors, agents, workflowConfiguration } = useHelper(
    (helper: LoggedHelper & CollectorHelper & AgentHelper & WorkflowConfigurationHelper) => ({
      settings: helper.getPlatformSettings(),
      collectors: helper.getExistingCollectors(),
      agents: helper.getAgents(),
      workflowConfiguration: workflowId ? helper.getWorkflowConfiguration(workflowId) : undefined,
    }),
  );

  const [injectsLoaded, setInjectsLoaded] = useState(false);
  useEffect(() => {
    let stale = false;
    setInjectsLoaded(false);
    loadInjects().finally(() => {
      if (!stale) setInjectsLoaded(true);
    });
    return () => {
      stale = true;
    };
  }, [loadInjects]);

  // The lightweight injects carry no update date: the key is made of the fields the checks read.
  const injectsKey = useMemo(() => JSON.stringify((injects ?? []).map(inject => [
    inject.inject_id,
    inject.inject_enabled,
    inject.inject_injector_contract?.injector_contract_id,
    inject.inject_assets,
    inject.inject_asset_groups,
    inject.inject_teams,
    inject.inject_content,
  ])), [injects]);
  const activeAgentsCount = useMemo(() => {
    const injectAssetIds = new Set((injects ?? []).flatMap(inject => inject.inject_assets ?? []));
    return (agents ?? []).filter((agent: Agent) => agent.agent_active && injectAssetIds.has(agent.agent_asset)).length;
  }, [injects, agents]);
  const workflowConfigurationKey = JSON.stringify(workflowConfiguration ?? null);

  const [healthchecks, setHealthchecks] = useState<HealthCheck[]>([]);
  const [expectationsDrift, setExpectationsDrift] = useState<ExpectationsDriftOutput | null>(null);

  // On failure the previous result stays: these are indicators, the backend logs the timeout.
  useEffect(() => {
    if (!injectsLoaded) return undefined;
    let stale = false;
    const timer = setTimeout(() => {
      fetchHealthchecks(id, false)
        .then((result) => {
          if (!stale) setHealthchecks(result.data);
        })
        .catch(() => {});
    }, SETTLE_DELAY_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [
    id,
    fetchHealthchecks,
    injectsLoaded,
    updatedAt,
    injectsKey,
    settings?.smtp_service_available,
    settings?.imap_service_available,
    collectors?.length,
    activeAgentsCount,
    workflowConfigurationKey,
  ]);

  useEffect(() => {
    if (!injectsLoaded) return undefined;
    let stale = false;
    const timer = setTimeout(() => {
      fetchExpectationsDrift(id, false)
        .then((result) => {
          if (!stale) setExpectationsDrift(result.data);
        })
        .catch(() => {});
    }, SETTLE_DELAY_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [id, fetchExpectationsDrift, injectsLoaded, injectsKey]);

  return useMemo(() => ({
    healthchecks,
    expectationsDrift,
    setExpectationsDrift,
  }), [healthchecks, expectationsDrift]);
};
