const getAuthorizedPerspectives = (): Map<string, string[]> => new Map([
  ['expectation-inject', ['base_created_at', 'inject_expectation_status', 'inject_expectation_type', 'base_updated_at', 'base_simulation_side', 'base_agent_side', 'base_asset_side', 'base_asset_group_side']],
  ['finding', ['base_created_at', 'finding_type', 'base_updated_at', 'base_endpoint_side', 'base_simulation_side']],
  ['endpoint', ['endpoint_arch', 'endpoint_platform', 'endpoint_ips', 'endpoint_hostname']],
  ['vulnerable-endpoint', ['vulnerable_endpoint_architecture', 'vulnerable_endpoint_agents_active_status', 'vulnerable_endpoint_agents_privileges', 'vulnerable_endpoint_platform', 'base_simulation_side']],
  ['inject', ['base_tags_side', 'base_endpoint_side', 'base_asset_group_side', 'base_team_side']],
  ['simulation', ['base_tags_side', 'base_endpoint_side', 'base_asset_group_side', 'base_team_side']],
  ['scenario', ['base_tags_side', 'base_endpoint_side', 'base_asset_group_side', 'base_team_side']],
]);

export default getAuthorizedPerspectives;
