package io.openbas.engine.model.endpoint;

import io.openbas.database.raw.RawEndpoint;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.engine.Handler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static io.openbas.engine.EsUtils.buildRestrictions;

@Service
public class EndpointHandler implements Handler<EsEndpoint> {

  private EndpointRepository endpointRepository;

  @Autowired
  public void setEndpointRepository(EndpointRepository endpointRepository) {
    this.endpointRepository = endpointRepository;
  }

  @Override
  public List<EsEndpoint> fetch(Instant from) {
    Instant queryFrom = from != null ? from : Instant.ofEpochMilli(0);
    List<RawEndpoint> forIndexing = endpointRepository.findForIndexing(queryFrom);
    return forIndexing.stream()
        .map(
                endpoint -> {
              EsEndpoint esEndpoint = new EsEndpoint();
              // Base
              esEndpoint.setBase_id(endpoint.getAsset_id());
              esEndpoint.setBase_representative(endpoint.getEndpoint_hostname());
              esEndpoint.setBase_created_at(endpoint.getAsset_created_at());
              esEndpoint.setBase_updated_at(endpoint.getAsset_updated_at());
              // not sure what to put here, if anything
              esEndpoint.setBase_restrictions(buildRestrictions(endpoint.getAsset_id()));

              esEndpoint.setEndpoint_ips(endpoint.getEndpoint_ips());
              esEndpoint.setEndpoint_hostname(endpoint.getEndpoint_hostname());
              esEndpoint.setEndpoint_platform(endpoint.getEndpoint_platform());
              esEndpoint.setEndpoint_arch(endpoint.getEndpoint_arch());
              esEndpoint.setEndpoint_mac_addresses(endpoint.getEndpoint_mac_addresses());
              // Dependencies
              List<String> dependencies = new ArrayList<>();
              if (!(endpoint.getEndpoint_findings() == null) && !endpoint.getEndpoint_findings().isEmpty()) {
                dependencies.addAll(endpoint.getEndpoint_findings());
                esEndpoint.setBase_findings_side(endpoint.getEndpoint_findings());
              }
              esEndpoint.setBase_dependencies(dependencies);
              return esEndpoint;
            })
        .toList();
  }
}
