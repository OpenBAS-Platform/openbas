package io.openbas.service;

import io.openbas.database.model.Agent;
import io.openbas.database.repository.AgentRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AgentService {

  private final AgentRepository agentRepository;

  public Agent createOrUpdateAgent(@NotNull final Agent agent) {
    return this.agentRepository.save(agent);
  }

  public void deleteAgent(@NotBlank final String agentId) {
    this.agentRepository.deleteById(agentId);
  }

  public Optional<Agent> findByExternalReference(String externalReference) {
    return agentRepository.findByExternalReference(externalReference);
  }
}
