package io.openbas.executors;

import io.openbas.database.model.Agent;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExecution;
import io.openbas.rest.exception.AgentException;
import java.util.List;
import java.util.Set;

public abstract class ExecutorContextService {

  public abstract void launchExecutorSubprocess(Inject inject, Endpoint assetEndpoint, Agent agent)
      throws AgentException;

  public abstract List<Agent> launchBatchExecutorSubprocess(
      Inject inject, Set<Agent> agents, InjectExecution injectExecution) throws InterruptedException;
}
