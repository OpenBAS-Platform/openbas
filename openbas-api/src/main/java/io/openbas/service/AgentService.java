package io.openbas.service;

import io.openbas.database.model.Agent;
import io.openbas.database.model.Endpoint;
import io.openbas.database.repository.AgentRepository;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import java.util.logging.Level;
import java.util.logging.Logger;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AgentService {

  private static final Logger LOGGER = Logger.getLogger(AgentService.class.getName());

  private final AgentRepository agentRepository;
  private final EndpointRepository endpointRepository;

  @Transactional(rollbackOn = Exception.class)
  public void delete(@NotBlank String agentId) {
    Agent agent =
        agentRepository
            .findById(agentId)
            .orElseThrow(() -> new ElementNotFoundException("Agent not found"));
    Endpoint endpoint =
        endpointRepository
            .findById(agent.getAsset().getId())
            .orElseThrow(() -> new ElementNotFoundException("Endpoint not found"));
    endpoint.getAgents().remove(agent);

    if (endpoint.getAgents().isEmpty()) {
      LOGGER.log(
          Level.WARNING,
          "The endpoint with ID {0} will be deleted because it has no associated agents.",
          endpoint.getId());
      endpointRepository.deleteById(endpoint.getId());
    }

    agentRepository.deleteById(agentId);
  }
}
