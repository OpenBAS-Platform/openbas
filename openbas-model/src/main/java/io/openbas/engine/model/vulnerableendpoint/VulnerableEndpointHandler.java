package io.openbas.engine.model.vulnerableendpoint;

import static io.openbas.engine.EsUtils.buildRestrictions;

import io.openbas.database.raw.RawVulnerableEndpoint;
import io.openbas.database.repository.VulnerableEndpointRepository;
import io.openbas.engine.Handler;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VulnerableEndpointHandler implements Handler<EsVulnerableEndpoint> {

  private VulnerableEndpointRepository vulnerableEndpointRepository;

  @Autowired
  public void setVulnerableEndpointRepository(
      VulnerableEndpointRepository vulnerableEndpointRepository) {
    this.vulnerableEndpointRepository = vulnerableEndpointRepository;
  }

  @Override
  public List<EsVulnerableEndpoint> fetch(Instant from) {
    Instant queryFrom = from != null ? from : Instant.ofEpochMilli(0);
    List<RawVulnerableEndpoint> forIndexing =
        vulnerableEndpointRepository.findForIndexing(queryFrom);
    return forIndexing.stream()
        .map(
            endpoint -> {
              EsVulnerableEndpoint esVulnerableEndpoint = new EsVulnerableEndpoint();
              // Base
              esVulnerableEndpoint.setBase_id(endpoint.getVulnerable_endpoint_id());
              esVulnerableEndpoint.setBase_representative(
                  endpoint.getVulnerable_endpoint_hostname());
              esVulnerableEndpoint.setBase_created_at(endpoint.getVulnerable_endpoint_created_at());
              esVulnerableEndpoint.setBase_updated_at(endpoint.getVulnerable_endpoint_updated_at());
              // not sure what to put here, if anything
              esVulnerableEndpoint.setBase_restrictions(
                  buildRestrictions(endpoint.getVulnerable_endpoint_id()));

              esVulnerableEndpoint.setVulnerable_endpoint_platform(
                  endpoint.getVulnerable_endpoint_platform());
              esVulnerableEndpoint.setVulnerable_endpoint_hostname(
                  endpoint.getVulnerable_endpoint_hostname());
              esVulnerableEndpoint.setVulnerable_endpoint_architecture(
                  endpoint.getVulnerable_endpoint_architecture());
              // Dependencies
              List<String> dependencies = new ArrayList<>();
              if (!(endpoint.getVulnerable_endpoint_findings() == null)
                  && !endpoint.getVulnerable_endpoint_findings().isEmpty()) {
                dependencies.addAll(endpoint.getVulnerable_endpoint_findings());
                esVulnerableEndpoint.setBase_findings_side(
                    endpoint.getVulnerable_endpoint_findings());
              }
              if (!(endpoint.getVulnerable_endpoint_tags() == null)
                  && !endpoint.getVulnerable_endpoint_tags().isEmpty()) {
                dependencies.addAll(endpoint.getVulnerable_endpoint_tags());
                esVulnerableEndpoint.setBase_tags_side(endpoint.getVulnerable_endpoint_tags());
              }
              if (!(endpoint.getVulnerable_endpoint_agents() == null)
                  && !endpoint.getVulnerable_endpoint_agents().isEmpty()) {
                dependencies.addAll(endpoint.getVulnerable_endpoint_agents());
                esVulnerableEndpoint.setBase_tags_side(endpoint.getVulnerable_endpoint_agents());
              }
              if (!(endpoint.getVulnerable_endpoint_simulation() == null)) {
                dependencies.add(endpoint.getVulnerable_endpoint_simulation());
                esVulnerableEndpoint.setBase_simulation_side(
                    endpoint.getVulnerable_endpoint_simulation());
              }
              esVulnerableEndpoint.setBase_dependencies(dependencies);
              return esVulnerableEndpoint;
            })
        .toList();
  }
}
