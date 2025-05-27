package io.openbas.executors;

import static io.openbas.database.model.ExecutionStatus.EXECUTING;
import static io.openbas.utils.InjectionUtils.isInInjectableRange;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.NullNode;
import io.openbas.asset.QueueService;
import io.openbas.database.model.*;
import io.openbas.database.model.Injector;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionExecutorService;
import io.openbas.rest.inject.service.InjectStatusService;
import io.openbas.telemetry.metric_collectors.ActionMetricCollector;
import io.openbas.utils.InjectUtils;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeoutException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class Executor {

  @Resource protected ObjectMapper mapper;

  private final ApplicationContext context;

  private final InjectStatusRepository injectStatusRepository;
  private final InjectorRepository injectorRepository;

  private final QueueService queueService;
  private final ActionMetricCollector actionMetricCollector;

  private final ExecutionExecutorService executionExecutorService;
  private final InjectStatusService injectStatusService;
  private final InjectUtils injectUtils;

  private InjectStatus executeExternal(ExecutableInject executableInject, Injector injector)
      throws IOException, TimeoutException {
    Inject inject = executableInject.getInjection().getInject();
    String jsonInject = mapper.writeValueAsString(executableInject);
    InjectStatus injectStatus =
        this.injectStatusRepository.findByInjectId(inject.getId()).orElseThrow();
    queueService.publish(injector.getType(), jsonInject);
    injectStatus.addInfoTrace(
        "The inject has been published and is now waiting to be consumed.",
        ExecutionTraceAction.EXECUTION);
    return this.injectStatusRepository.save(injectStatus);
  }

  private InjectStatus executeInternal(ExecutableInject executableInject, Injector injector) {
    Inject inject = executableInject.getInjection().getInject();
    io.openbas.executors.Injector executor =
        this.context.getBean(injector.getType(), io.openbas.executors.Injector.class);
    Execution execution = executor.executeInjection(executableInject);
    // After execution, expectations are already created
    // Injection status is filled after complete execution
    // Report inject execution
    InjectStatus injectStatus =
        this.injectStatusRepository.findByInjectId(inject.getId()).orElseThrow();
    InjectStatus completeStatus = injectStatusService.fromExecution(execution, injectStatus);
    return injectStatusRepository.save(completeStatus);
  }

  public void execute(
      ExecutableInject executableInject,
      Map<String, Map<String, JsonNode>> executionWithTargetKeyAndValue)
      throws IOException, TimeoutException {
    Inject inject = executableInject.getInjection().getInject();
    InjectorContract injectorContract =
        inject
            .getInjectorContract()
            .orElseThrow(
                () -> new UnsupportedOperationException("Inject does not have a contract"));

    // Telemetry
    actionMetricCollector.addInjectPlayedCount(injectorContract.getInjector().getType());

    // Depending on injector type (internal or external) execution must be done differently
    Injector injector =
        injectorRepository
            .findByType(injectorContract.getInjector().getType())
            .orElseThrow(
                () ->
                    new IllegalStateException(
                        "Injector not found for type: "
                            + injectorContract.getInjector().getType()));

    inject.setStatus(EXECUTING);
    inject.setFirstExecutionDate(Instant.now());
    // Executions
    // Here We create n executions depending on InjectDependency/InjectBindings and on the size of
    // StructuredOutput
    // Map<String, Map<String, JsonNode>>, n execution should be map.keys
    for (Map.Entry<String, Map<String, JsonNode>> entry :
        executionWithTargetKeyAndValue.entrySet()) {
      String parentExecutionId = entry.getKey();
      Map<String, JsonNode> targetKeyToValue = entry.getValue();

      List<Map<String, JsonNode>> expandedExecutions = explodePerExecution(targetKeyToValue);

      for (Map<String, JsonNode> perExecInput : expandedExecutions) {
        // Initialize execution
        InjectStatus executionStatus = new InjectStatus();
        executionStatus.setInject(inject);
        executionStatus.setTrackingSentDate(Instant.now());
        executionStatus.setName(EXECUTING);
        executionStatus.setTrackingSentDate(Instant.now());
        executionStatus.setPayloadOutput(injectUtils.getStatusPayloadFromInject(inject));

        // Create and attach execution bindings
        List<ExecutionBinding> bindings = new ArrayList<>();
        for (Map.Entry<String, JsonNode> bindingEntry : perExecInput.entrySet()) {
          ExecutionBinding binding = new ExecutionBinding();
          binding.setArgumentKey(bindingEntry.getKey());
          binding.setArgumentValue(
              bindingEntry.getValue().toString()); // Convert JsonNode to String
          binding.setExecution(executionStatus);

          // parentExecutionId is available from the outer loop
          InjectStatus sourceExecutionStatus =
              injectStatusRepository
                  .findById(parentExecutionId)
                  .orElseThrow(
                      () ->
                          new IllegalStateException(
                              "Source execution not found: " + parentExecutionId));
          binding.setSourceExecution(sourceExecutionStatus);

          bindings.add(binding);
        }

        executionStatus.setExecutionBindings(bindings);
        injectStatusRepository.save(executionStatus);
        inject.getExecutions().add(executionStatus);

        // Execute
        if (Boolean.TRUE.equals(injectorContract.getNeedsExecutor())) {
          executionExecutorService.launchExecutorContext(inject);
        }

        if (injector.isExternal()) {
          executeExternal(executableInject, injector);
        } else {
          executeInternal(executableInject, injector);
        }
      }
    }

    if (executionWithTargetKeyAndValue.isEmpty()) {
      InjectStatus executionStatus =
          injectStatusService.initializeInjectStatus(inject.getId(), EXECUTING);
      // Set bindings in the status
      inject.getExecutions().add(executionStatus);
      if (Boolean.TRUE.equals(injectorContract.getNeedsExecutor())) {
        this.executionExecutorService.launchExecutorContext(inject);
      }
      if (injector.isExternal()) {
        executeExternal(executableInject, injector);
      } else {
        executeInternal(executableInject, injector);
      }
    }
  }

  private List<Map<String, JsonNode>> explodePerExecution(Map<String, JsonNode> bindings) {
    // Find max array length
    int maxLength =
        bindings.values().stream()
            .filter(JsonNode::isArray)
            .mapToInt(JsonNode::size)
            .max()
            .orElse(1);

    List<Map<String, JsonNode>> executionInputs = new ArrayList<>();

    for (int i = 0; i < maxLength; i++) {
      Map<String, JsonNode> inputForExecution = new HashMap<>();

      for (Map.Entry<String, JsonNode> entry : bindings.entrySet()) {
        String key = entry.getKey();
        JsonNode value = entry.getValue();

        if (value.isArray()) {
          // Use i-th element if exists, else null
          inputForExecution.put(key, i < value.size() ? value.get(i) : NullNode.getInstance());
        } else {
          // Use scalar as-is
          inputForExecution.put(key, value);
        }
      }

      executionInputs.add(inputForExecution);
    }

    return executionInputs;
  }

  public void directExecute(ExecutableInject executableInject)
      throws IOException, TimeoutException {
    boolean isScheduledInject = !executableInject.isDirect();
    // If empty content, inject must be rejected
    Inject inject = executableInject.getInjection().getInject();
    if (inject.getContent() == null) {
      throw new UnsupportedOperationException("Inject is empty");
    }
    // If inject is too old, reject the execution
    if (isScheduledInject && !isInInjectableRange(inject)) {
      throw new UnsupportedOperationException(
          "Inject is now too old for execution: id "
              + inject.getId()
              + ", launch date "
              + inject.getDate()
              + ", now date "
              + Instant.now());
    }

    this.execute(executableInject, null); // TODO POC Change Return void
  }
}
