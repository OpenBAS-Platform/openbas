package io.openbas.executors;

import static io.openbas.utils.InjectionUtils.isInInjectableRange;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.asset.QueueService;
import io.openbas.database.model.*;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.model.Injector;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionExecutorService;
import io.openbas.rest.inject.service.InjectStatusService;
import jakarta.annotation.Resource;
import java.time.Instant;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class Executor {

  @Resource protected ObjectMapper mapper;

  private final ApplicationContext context;

  private final InjectStatusRepository injectStatusRepository;

  private final InjectorRepository injectorRepository;

  private final InjectRepository injectRepository;

  private final QueueService queueService;

  private final ExecutionExecutorService executionExecutorService;
  private final InjectStatusService injectStatusService;

  private InjectStatus executeExternal(ExecutableInject executableInject, Inject inject) {
    InjectorContract injectorContract =
        inject
            .getInjectorContract()
            .orElseThrow(
                () -> new UnsupportedOperationException("Inject does not have a contract"));

    InjectStatus status = injectStatusRepository.findByInject(inject).orElse(new InjectStatus());
    status.setTrackingSentDate(Instant.now());
    status.setInject(inject);
    try {
      String jsonInject = mapper.writeValueAsString(executableInject);
      status.setName(ExecutionStatus.PENDING); // FIXME: need to be test with HTTP Collector
      status.addTrace(
          ExecutionTraceStatus.INFO,
          "The inject has been published and is now waiting to be consumed.",
          ExecutionTraceAction.EXECUTION,
          null);
      queueService.publish(injectorContract.getInjector().getType(), jsonInject);
    } catch (Exception e) {
      status.setName(ExecutionStatus.ERROR);
      status.setTrackingEndDate(Instant.now());
      status.addErrorTrace(e.getMessage(), ExecutionTraceAction.COMPLETE);
    } finally {
      return injectStatusRepository.save(status);
    }
  }

  private InjectStatus executeInternal(ExecutableInject executableInject, Inject inject) {
    InjectorContract injectorContract =
        inject
            .getInjectorContract()
            .orElseThrow(
                () -> new UnsupportedOperationException("Inject does not have a contract"));

    io.openbas.executors.Injector executor =
        this.context.getBean(
            injectorContract.getInjector().getType(), io.openbas.executors.Injector.class);
    Execution execution = executor.executeInjection(executableInject);
    Inject executedInject = injectRepository.findById(inject.getId()).orElseThrow();
    InjectStatus completeStatus = injectStatusService.fromExecution(execution, executedInject);
    return injectStatusRepository.save(completeStatus);
  }

  public InjectStatus execute(ExecutableInject executableInject) {
    boolean isScheduledInject = !executableInject.isDirect();
    // If empty content, inject must be rejected
    Inject inject = executableInject.getInjection().getInject();
    if (inject.getContent() == null) {
      throw new UnsupportedOperationException("Inject is empty");
    }
    // If inject is too old, reject the execution
    if (isScheduledInject && !isInInjectableRange(inject)) {
      throw new UnsupportedOperationException("Inject is now too old for execution");
    }

    InjectorContract injectorContract =
        inject
            .getInjectorContract()
            .orElseThrow(
                () -> new UnsupportedOperationException("Inject does not have a contract"));

    // Depending on injector type (internal or external) execution must be done differently
    Optional<Injector> externalInjector =
        injectorRepository.findByType(injectorContract.getInjector().getType());

    return externalInjector
        .map(Injector::isExternal)
        .map(
            isExternal -> {
              ExecutableInject newExecutableInject = executableInject;
              if (injectorContract.getNeedsExecutor()) {
                try {
                  newExecutableInject =
                      this.executionExecutorService.launchExecutorContext(executableInject, inject);
                } catch (InterruptedException e) {
                  throw new RuntimeException(e);
                }
              }
              if (isExternal) {
                return executeExternal(newExecutableInject, inject);
              } else {
                return executeInternal(newExecutableInject, inject);
              }
            })
        .orElseThrow(
            () ->
                new IllegalStateException(
                    "External injector not found for type: "
                        + injectorContract.getInjector().getType()));
  }
}
