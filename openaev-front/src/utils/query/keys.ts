import { type QueryKey } from '@tanstack/react-query';

// Query keys map to stream topics through their first two segments:
// - a list key starts with ['list', <entity>] and is invalidated by the topic 'list:<entity>';
// - an entity key starts with [<entity>, <id>] and is invalidated by the topic '<entity>:<id>',
//   for the entities in ENTITY_SEGMENTS only.
// Segments after the first two (search input, context, sub-resource) only tell apart the queries
// that one topic invalidates together.
const LIST_SEGMENT = 'list';
const TOPIC_SEPARATOR = ':';

export const ATOMIC_TESTING_SEGMENT = 'atomic-testing';
export const SCENARIO_SEGMENT = 'scenario';
export const SIMULATION_SEGMENT = 'simulation';
export const ASSET_SEGMENT = 'asset';
export const ASSET_GROUP_SEGMENT = 'asset-group';
export const FINDING_SEGMENT = 'finding';
export const TEAM_SEGMENT = 'team';
export const PERSON_SEGMENT = 'person';
export const ORGANIZATION_SEGMENT = 'organization';
export const PAYLOAD_SEGMENT = 'payload';
export const CREDENTIAL_SEGMENT = 'credential';
export const DASHBOARD_SEGMENT = 'dashboard';
export const REPORT_SEGMENT = 'report';
const ENTITY_SEGMENTS = new Set<string>([
  DASHBOARD_SEGMENT,
  REPORT_SEGMENT,
  PAYLOAD_SEGMENT,
  CREDENTIAL_SEGMENT,
  TEAM_SEGMENT,
  PERSON_SEGMENT,
  ORGANIZATION_SEGMENT,
  ATOMIC_TESTING_SEGMENT,
  SCENARIO_SEGMENT,
  SIMULATION_SEGMENT,
  ASSET_SEGMENT,
  ASSET_GROUP_SEGMENT,
  FINDING_SEGMENT,
]);

export const SCENARIOS_LIST_KEY = [LIST_SEGMENT, 'scenarios'] as const;
export const ATOMIC_TESTINGS_LIST_KEY = [LIST_SEGMENT, 'atomic-testings'] as const;
export const SIMULATIONS_LIST_KEY = [LIST_SEGMENT, 'simulations'] as const;
// Every asset list (endpoints, inventory, agentless, AI targets) shares one topic.
export const ASSETS_LIST_KEY = [LIST_SEGMENT, 'assets'] as const;
export const ASSET_GROUPS_LIST_KEY = [LIST_SEGMENT, 'asset-groups'] as const;
export const FINDINGS_LIST_KEY = [LIST_SEGMENT, 'findings'] as const;
// Every integration screen (injectors, collectors, executors, connector instances, catalog, and
// their detail pages) shares one topic: integrations change rarely and are few.
export const INTEGRATIONS_LIST_KEY = [LIST_SEGMENT, 'integrations'] as const;
export const TEAMS_LIST_KEY = [LIST_SEGMENT, 'teams'] as const;
export const PERSONS_LIST_KEY = [LIST_SEGMENT, 'persons'] as const;
export const ORGANIZATIONS_LIST_KEY = [LIST_SEGMENT, 'organizations'] as const;
// The threat arsenal: payloads and the other arsenal entries listed with them.
export const PAYLOADS_LIST_KEY = [LIST_SEGMENT, 'payloads'] as const;
export const CREDENTIALS_LIST_KEY = [LIST_SEGMENT, 'credentials'] as const;
// Every components screen (documents, channels, challenges, lessons templates, phishing
// templates, ...) and their detail pages share one topic: they change rarely.
export const COMPONENTS_LIST_KEY = [LIST_SEGMENT, 'components'] as const;
export const DASHBOARDS_LIST_KEY = [LIST_SEGMENT, 'dashboards'] as const;
export const REPORTS_LIST_KEY = [LIST_SEGMENT, 'reports'] as const;
// Every widget data query (custom dashboards, the home dashboard, simulation statistics, ...):
// the topic fires when the search engine has indexed new data for the tenant.
export const ANALYTICS_KEY = [LIST_SEGMENT, 'analytics'] as const;

// Every query of one atomic testing screen (overview, targets, findings, ...) starts with this key,
// so the topic 'atomic-testing:<id>' refetches all of them at once.
export const atomicTestingKey = (injectId: string) => [ATOMIC_TESTING_SEGMENT, injectId] as const;

// Every query of one scenario screen (scenario, injects, teams, simulations, ...) starts with this
// key, so the topic 'scenario:<id>' refetches all of them at once.
export const scenarioKey = (scenarioId: string) => [SCENARIO_SEGMENT, scenarioId] as const;

// Every query of one simulation screen (simulation, injects, timeline, mails, ...) starts with this
// key, so the topic 'simulation:<id>' refetches all of them at once.
export const simulationKey = (simulationId: string) => [SIMULATION_SEGMENT, simulationId] as const;

// One asset's detail screen (endpoint and its agents, findings, injects played on it, ...).
export const assetKey = (assetId: string) => [ASSET_SEGMENT, assetId] as const;
export const assetGroupKey = (assetGroupId: string) => [ASSET_GROUP_SEGMENT, assetGroupId] as const;
export const findingKey = (findingId: string) => [FINDING_SEGMENT, findingId] as const;

export const teamKey = (teamId: string) => [TEAM_SEGMENT, teamId] as const;
export const personKey = (userId: string) => [PERSON_SEGMENT, userId] as const;
export const organizationKey = (organizationId: string) => [ORGANIZATION_SEGMENT, organizationId] as const;

export const payloadKey = (payloadId: string) => [PAYLOAD_SEGMENT, payloadId] as const;
export const credentialKey = (credentialId: string) => [CREDENTIAL_SEGMENT, credentialId] as const;

export const dashboardKey = (dashboardId: string) => [DASHBOARD_SEGMENT, dashboardId] as const;
export const reportKey = (reportId: string) => [REPORT_SEGMENT, reportId] as const;

export const topicOfKey = (queryKey: QueryKey): string | undefined => {
  const [kind, second] = queryKey;
  if (typeof kind !== 'string' || typeof second !== 'string' || second.length === 0) {
    return undefined;
  }
  if (kind !== LIST_SEGMENT && !ENTITY_SEGMENTS.has(kind)) {
    return undefined;
  }
  return `${kind}${TOPIC_SEPARATOR}${second}`;
};

export const keyOfTopic = (topic: string): QueryKey => topic.split(TOPIC_SEPARATOR);
