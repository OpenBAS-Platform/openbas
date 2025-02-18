package io.openbas.execution;

import io.openbas.database.model.*;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.executors.ExecutorContextService;
import io.openbas.rest.exception.AgentException;
import io.openbas.rest.inject.service.InjectService;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log
public class ExecutionExecutorService {

  private final ApplicationContext context;

  private final InjectStatusRepository injectStatusRepository;
  private final InjectService injectService;

  public void launchExecutorContext(Inject inject) {
    // First, get the agents of this injects
    List<Agent> agents = this.injectService.getAgentsByInject(inject);

    InjectStatus injectStatus =
        inject.getStatus().orElseThrow(() -> new IllegalArgumentException("Status should exist"));
    AtomicBoolean atLeastOneExecution = new AtomicBoolean(false);
    AtomicBoolean atOneTraceAdded = new AtomicBoolean(false);

    agents.forEach(
        agent -> {
          try {
            launchExecutorContextForAgent(inject, agent);
            atLeastOneExecution.set(true);
          } catch (AgentException e) {
            ExecutionTraceStatus traceStatus =
                e.getMessage().startsWith("Agent error")
                    ? ExecutionTraceStatus.AGENT_INACTIVE
                    : ExecutionTraceStatus.ERROR;
            injectStatus.addTrace(
                traceStatus, e.getMessage(), ExecutionTraceAction.COMPLETE, e.getAgent());
            atOneTraceAdded.set(true);
          }
        });
    // if launchExecutorContextForAgent fail for every agent we throw to manually set injectStatus
    // to error
    if (atOneTraceAdded.get()) {
      this.injectStatusRepository.save(injectStatus);
    }
    if (!atLeastOneExecution.get()) {
      throw new ExecutionExecutorException("No asset executed");
    }
  }

  private void launchExecutorContextForAgent(Inject inject, Agent agent) throws AgentException {
    Endpoint assetEndpoint = (Endpoint) Hibernate.unproxy(agent.getAsset());
    Executor executor = agent.getExecutor();
    if (executor == null) {
      throw new AgentException(
          "Cannot find the executor for the agent "
              + agent.getExecutedByUser()
              + " from the asset "
              + assetEndpoint.getName(),
          agent);
    } else if (!agent.isActive()) {
      throw new AgentException(
          "Agent error: agent "
              + agent.getExecutedByUser()
              + " is inactive for the asset "
              + assetEndpoint.getName(),
          agent);
    } else {
      try {
        ExecutorContextService executorContextService =
            context.getBean(agent.getExecutor().getType(), ExecutorContextService.class);
        executorContextService.launchExecutorSubprocess(inject, assetEndpoint, agent);
      } catch (NoSuchBeanDefinitionException e) {
        throw new AgentException("Fatal error: Unsupported executor " + executor.getType(), agent);
      }
    }
  }
}
