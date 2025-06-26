package io.openbas.database.raw;

import java.time.Instant;
import java.util.Set;

public interface RawVulnerableEndpoint {
  String getVulnerable_endpoint_id();

  Instant getVulnerable_endpoint_created_at();

  Instant getVulnerable_endpoint_updated_at();

  String getVulnerable_endpoint_hostname();

  String getVulnerable_endpoint_platform();

  String getVulnerable_endpoint_architecture();

  String getVulnerable_endpoint_simulation();

  Set<String> getVulnerable_endpoint_agents();

  Set<String> getVulnerable_endpoint_findings();

  Set<String> getVulnerable_endpoint_tags();
}
