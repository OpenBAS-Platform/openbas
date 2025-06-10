package io.openbas.executors;

import static io.openbas.database.model.ExecutionStatus.EXECUTING;
import static io.openbas.utils.InjectionUtils.isInInjectableRange;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.asset.QueueService;
import io.openbas.database.model.*;
import io.openbas.database.model.Injector;
import io.openbas.database.repository.InjectExecutionRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionExecutorService;
import io.openbas.rest.inject.service.InjectExecutionService;
import io.openbas.telemetry.metric_collectors.ActionMetricCollector;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.TimeoutException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class Executor {

  @Resource protected ObjectMapper mapper;

  private final ApplicationContext context;

  private final InjectExecutionRepository injectExecutionRepository;
  private final InjectorRepository injectorRepository;

  private final QueueService queueService;
  private final ActionMetricCollector actionMetricCollector;

  private final ExecutionExecutorService executionExecutorService;
  private final InjectExecutionService injectExecutionService;

  private InjectExecution executeExternal(ExecutableInject executableInject, Injector injector)
      throws IOException, TimeoutException {
    Inject inject = executableInject.getInjection().getInject();
    String jsonInject = mapper.writeValueAsString(executableInject);
    InjectExecution injectExecution =
        this.injectExecutionRepository.findByInjectId(inject.getId()).orElseThrow();
    queueService.publish(injector.getType(), jsonInject);
    injectExecution.addInfoTrace(
        "The inject has been published and is now waiting to be consumed.",
        ExecutionTraceAction.EXECUTION);
    return this.injectExecutionRepository.save(injectExecution);
  }

  private InjectExecution executeInternal(ExecutableInject executableInject, Injector injector) {
    Inject inject = executableInject.getInjection().getInject();
    // [issue/2797] logs -> we try to understand why we can't reproduce on dev and
    // test-feature-branch env so those
    // logs are for tests on prerelease env with the scenario "20250318 REP-YGN Fermeture temporaire
    // KUC - test Dam"
    log.info("[issue/2797] executeInternal 1: " + inject.getId());
    io.openbas.executors.Injector executor =
        this.context.getBean(injector.getType(), io.openbas.executors.Injector.class);
    log.info("[issue/2797] executeInternal 2: " + inject.getId());
    Execution execution = executor.executeInjection(executableInject);
    log.info("[issue/2797] executeInternal 3: " + inject.getId());
    // After execution, expectations are already created
    // Injection status is filled after complete execution
    // Report inject execution
    InjectExecution injectExecution =
        this.injectExecutionRepository.findByInjectId(inject.getId()).orElseThrow();
    log.info("[issue/2797] executeInternal 4: " + inject.getId());
    InjectExecution completeStatus =
        injectExecutionService.fromExecution(execution, injectExecution);
    log.info("[issue/2797] executeInternal 5: " + inject.getId());
    return injectExecutionRepository.save(completeStatus);
  }

  public InjectExecution execute(ExecutableInject executableInject)
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

    // Status
    InjectExecution updatedStatus =
        this.injectExecutionService.initializeInjectStatus(inject.getId(), EXECUTING);
    inject.setExecutions(new ArrayList<>(Arrays.asList(updatedStatus)));
    if (Boolean.TRUE.equals(injectorContract.getNeedsExecutor())) {
      this.executionExecutorService.launchExecutorContext(inject);
    }
    if (injector.isExternal()) {
      return executeExternal(executableInject, injector);
    } else {
      return executeInternal(executableInject, injector);
    }
  }

  public InjectExecution directExecute(ExecutableInject executableInject)
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

    return this.execute(executableInject);
  }
}
