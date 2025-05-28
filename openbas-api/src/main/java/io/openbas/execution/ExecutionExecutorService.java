package io.openbas.execution;

import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_NAME;
import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_TYPE;

import io.openbas.database.model.*;
import io.openbas.database.repository.ExecutionTraceRepository;
import io.openbas.executors.ExecutorContextService;
import io.openbas.rest.exception.AgentException;
import io.openbas.rest.inject.service.InjectService;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log
public class ExecutionExecutorService {

  private final ApplicationContext context;

  private final ExecutionTraceRepository executionTraceRepository;
  private final InjectService injectService;

  public void launchExecutorContext(Inject inject, InjectStatus execution) {
    // First, get the agents of this injects
    List<Agent> agents = this.injectService.getAgentsByInject(inject);
    // Filter each list to do something for each specific case and then remove the specific agents
    // from the main "agents" list to execute payloads at the end for the remaining "normal" agents
    List<Agent> inactiveAgents = agents.stream().filter(agent -> !agent.isActive()).toList();
    agents.removeAll(inactiveAgents);
    List<Agent> agentsWithoutExecutor =
        agents.stream().filter(agent -> agent.getExecutor() == null).toList();
    agents.removeAll(agentsWithoutExecutor);
    List<Agent> crowdstrikeAgents =
        agents.stream()
            .filter(agent -> CROWDSTRIKE_EXECUTOR_TYPE.equals(agent.getExecutor().getType()))
            .collect(Collectors.toList());
    agents.removeAll(crowdstrikeAgents);

    AtomicBoolean atLeastOneExecution = new AtomicBoolean(false);
    // Manage inactive agents
    if (!inactiveAgents.isEmpty()) {
      executionTraceRepository.saveAll(
          inactiveAgents.stream()
              .map(
                  agent ->
                      new ExecutionTrace(
                          execution,
                          ExecutionTraceStatus.AGENT_INACTIVE,
                          List.of(),
                          "Agent "
                              + agent.getExecutedByUser()
                              + " is inactive for the asset "
                              + agent.getAsset().getName(),
                          ExecutionTraceAction.COMPLETE,
                          agent,
                          null))
              .toList());
    }
    // Manage without executor agents
    if (!agentsWithoutExecutor.isEmpty()) {
      executionTraceRepository.saveAll(
          agentsWithoutExecutor.stream()
              .map(
                  agent ->
                      new ExecutionTrace(
                          execution,
                          ExecutionTraceStatus.ERROR,
                          List.of(),
                          "Cannot find the executor for the agent "
                              + agent.getExecutedByUser()
                              + " from the asset "
                              + agent.getAsset().getName(),
                          ExecutionTraceAction.COMPLETE,
                          agent,
                          null))
              .toList());
    }
    // Manage Crowdstrike agents for batch execution
    if (!crowdstrikeAgents.isEmpty()) {
      try {
        ExecutorContextService executorContextService =
            context.getBean(CROWDSTRIKE_EXECUTOR_NAME, ExecutorContextService.class);
        crowdstrikeAgents =
            executorContextService.launchBatchExecutorSubprocess(
                inject, crowdstrikeAgents, execution);
        atLeastOneExecution.set(true);
      } catch (Exception e) {
        log.severe("Crowdstrike launchBatchExecutorSubprocess error: " + e.getMessage());
        executionTraceRepository.saveAll(
            crowdstrikeAgents.stream()
                .map(
                    agent ->
                        new ExecutionTrace(
                            execution,
                            ExecutionTraceStatus.ERROR,
                            List.of(),
                            e.getMessage(),
                            ExecutionTraceAction.COMPLETE,
                            agent,
                            null))
                .toList());
      }
    }
    // Manage remaining agents
    agents.forEach(
        agent -> {
          try {
            launchExecutorContextForAgent(inject, agent, execution);
            atLeastOneExecution.set(true);
          } catch (AgentException e) {
            log.severe("launchExecutorContextForAgent error: " + e.getMessage());
            executionTraceRepository.save(
                new ExecutionTrace(
                    execution,
                    ExecutionTraceStatus.ERROR,
                    List.of(),
                    e.getMessage(),
                    ExecutionTraceAction.COMPLETE,
                    e.getAgent(),
                    null));
          }
        });
    if (!atLeastOneExecution.get()) {
      throw new ExecutionExecutorException("No asset executed");
    }
  }

  private void launchExecutorContextForAgent(Inject inject, Agent agent, InjectStatus execution)
      throws AgentException {
    try {
      Endpoint assetEndpoint = (Endpoint) Hibernate.unproxy(agent.getAsset());
      ExecutorContextService executorContextService =
          context.getBean(agent.getExecutor().getName(), ExecutorContextService.class);
      executorContextService.launchExecutorSubprocess(inject, assetEndpoint, agent, execution);
    } catch (Exception e) {
      log.severe(e.getMessage());
      throw new AgentException("Fatal error: " + e.getMessage(), agent);
    }
  }
}
