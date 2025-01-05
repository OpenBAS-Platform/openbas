package io.openbas.rest.agent;

import static io.openbas.database.model.User.ROLE_ADMIN;

import io.openbas.service.AgentService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_ADMIN)
public class AgentApi {

  public static final String AGENT_URI = "/api/agents";

  private final AgentService agentService;

  @DeleteMapping(AGENT_URI + "/{agentId}")
  @Transactional(rollbackFor = Exception.class)
  public void delete(@PathVariable @NotBlank final String agentId) {
    this.agentService.delete(agentId);
  }
}
