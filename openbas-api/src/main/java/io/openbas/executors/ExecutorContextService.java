package io.openbas.executors;

import io.openbas.database.model.Agent;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectStatus;
import io.openbas.rest.exception.AgentException;
import java.util.List;

public abstract class ExecutorContextService {

  public abstract void launchExecutorSubprocess(Inject inject, Endpoint assetEndpoint, Agent agent)
      throws AgentException;

  public abstract void launchBatchExecutorSubprocess(
      Inject inject, List<Agent> agents, InjectStatus injectStatus) throws AgentException;
}
