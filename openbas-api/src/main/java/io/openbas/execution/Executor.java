package io.openbas.execution;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.asset.QueueService;
import io.openbas.database.model.Injector;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.database.repository.InjectorRepository;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static io.openbas.database.model.InjectStatusExecution.traceInfo;

@Component
public class Executor {

    @Resource
    protected ObjectMapper mapper;

    private ApplicationContext context;

    private InjectStatusRepository injectStatusRepository;

    private InjectorRepository injectorRepository;

    private InjectRepository injectRepository;

    private QueueService queueService;

    private ExecutionExecutorService executionExecutorService;

    @Autowired
    public void setQueueService(QueueService queueService) {
        this.queueService = queueService;
    }

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    @Autowired
    public void setInjectorRepository(InjectorRepository injectorRepository) {
        this.injectorRepository = injectorRepository;
    }

    @Autowired
    public void setInjectStatusRepository(InjectStatusRepository injectStatusRepository) {
        this.injectStatusRepository = injectStatusRepository;
    }

    @Autowired
    public void setExecutionExecutorService(ExecutionExecutorService executionExecutorService) {
        this.executionExecutorService = executionExecutorService;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    private InjectStatus executeExternal(ExecutableInject executableInject, Inject inject) {
        InjectorContract injectorContract = inject.getInjectorContract()
                .orElseThrow(() -> new UnsupportedOperationException("Inject does not have a contract"));

        InjectStatus status = injectStatusRepository.findByInject(inject).orElse(new InjectStatus());
        status.setTrackingSentDate(Instant.now());
        status.setInject(inject);
        try {
            String jsonInject = mapper.writeValueAsString(executableInject);
            status.setName(ExecutionStatus.PENDING); // FIXME: need to be test with HTTP Collector
            status.getTraces().add(traceInfo("The inject has been published and is now waiting to be consumed."));
            queueService.publish(injectorContract.getInjector().getType(), jsonInject);
        } catch (Exception e) {
            status.setName(ExecutionStatus.ERROR);
            status.getTraces().add(InjectStatusExecution.traceError(e.getMessage()));
        } finally {
            return injectStatusRepository.save(status);
        }
    }

    private InjectStatus executeInternal(ExecutableInject executableInject, Inject inject) {
        InjectorContract injectorContract = inject.getInjectorContract()
                .orElseThrow(() -> new UnsupportedOperationException("Inject does not have a contract"));

        io.openbas.execution.Injector executor = this.context.getBean(injectorContract.getInjector().getType(), io.openbas.execution.Injector.class);
        Execution execution = executor.executeInjection(executableInject);
        Inject executedInject = injectRepository.findById(inject.getId()).orElseThrow();
        InjectStatus completeStatus = InjectStatus.fromExecution(execution, executedInject);
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

        InjectorContract injectorContract = inject.getInjectorContract().orElseThrow(() -> new UnsupportedOperationException("Inject does not have a contract"));

        // Depending on injector type (internal or external) execution must be done differently
        Optional<Injector> externalInjector = injectorRepository.findByType(injectorContract.getInjector().getType());

        return externalInjector
                .map(Injector::isExternal)
                .map(isExternal -> {
                    ExecutableInject newExecutableInject = executableInject;
                    if (injectorContract.getNeedsExecutor()) {
                        try {
                            newExecutableInject = this.executionExecutorService.launchExecutorContext(executableInject, inject);
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
                .orElseThrow(() -> new IllegalStateException("External injector not found for type: " + injectorContract.getInjector().getType()));
    }

    // region utils
    private boolean isInInjectableRange(Injection injection) {
        Instant now = Instant.now();
        Instant start = now.minus(Duration.parse("PT1H"));
        Instant injectWhen = injection.getDate().orElseThrow();
        return injectWhen.isAfter(start) && injectWhen.isBefore(now);
    }
}
