package io.openbas.service;

import io.openbas.database.model.*;
import io.openbas.database.repository.AgentRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AgentService {

  private final AgentRepository agentRepository;

  public Optional<Agent> getAgentForAnAsset(
      String assetId,
      String user,
      Agent.DEPLOYMENT_MODE deploymentMode,
      Agent.PRIVILEGE privilege,
      String executor) {
    return agentRepository.findByAssetExecutorUserDeploymentAndPrivilege(
        assetId, user, deploymentMode.name(), privilege.name(), executor);
  }

  public List<Agent> getAgentsForExecution() {
    return agentRepository.findForExecution();
  }

  public Agent createOrUpdateAgent(@NotNull final Agent agent) {
    return this.agentRepository.save(agent);
  }

  public void deleteAgent(@NotBlank final String agentId) {
    this.agentRepository.deleteByAgentId(agentId);
  }

  public List<Agent> findByExternalReference(String externalReference) {
    return agentRepository.findByExternalReference(externalReference);
  }
}
