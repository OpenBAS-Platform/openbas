package io.openbas.service;

import io.openbas.database.repository.AgentRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AgentService {

  private final AgentRepository agentRepository;

  public void delete(@NotBlank String endpointId) {
    agentRepository.deleteById(endpointId);
  }
}
