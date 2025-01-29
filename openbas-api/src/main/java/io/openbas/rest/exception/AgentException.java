package io.openbas.rest.exception;

import io.openbas.database.model.Agent;
import lombok.Getter;

@Getter
public class AgentException extends RuntimeException {
  private final Agent agent;

  public AgentException(String message, Agent agent) {
    super(message);
    this.agent = agent;
  }
}
