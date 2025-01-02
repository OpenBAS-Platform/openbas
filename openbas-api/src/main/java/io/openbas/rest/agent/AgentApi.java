package io.openbas.rest.agent;

import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.rest.agent.service.AgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class AgentApi {

  public static final String ENDPOINT_URI = "/api/agents";

  private final AgentService agentService;
}
