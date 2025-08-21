package io.openbas.rest.agent;

import io.openbas.service.AgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class AgentApi {

  public static final String ENDPOINT_URI = "/api/agents";

  private final AgentService agentService;
}
