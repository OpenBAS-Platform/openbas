package io.openbas.execution;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Injector;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.service.QueueService;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Component
public class Executor {

    @Resource
    protected ObjectMapper mapper;

    private ApplicationContext context;

    private InjectStatusRepository injectStatusRepository;

    private InjectorRepository injectorRepository;

    private InjectRepository injectRepository;

    private QueueService queueService;

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
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    private InjectStatus executeExternal(ExecutableInject executableInject, Inject inject) {
        InjectStatus status = injectStatusRepository.findByInject(inject).orElse(new InjectStatus());
        status.setTrackingSentDate(Instant.now());
        status.setInject(inject);
        try {
            String jsonInject = mapper.writeValueAsString(executableInject);
            InjectStatus savedStatus = injectStatusRepository.save(status);
            queueService.publish(inject.getType(), jsonInject);
            return savedStatus;
        } catch (Exception e) {
            status.setName(ExecutionStatus.ERROR);
            status.getTraces().add(InjectStatusExecution.traceError(e.getMessage()));
            return injectStatusRepository.save(status);
        }
    }

    private InjectStatus executeInternal(ExecutableInject executableInject) {
        Inject inject = executableInject.getInjection().getInject();
        io.openbas.execution.Injector executor = this.context.getBean(inject.getType(), io.openbas.execution.Injector.class);
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
        // Depending on injector type (internal or external) execution must be done differently
        Optional<Injector> externalInjector = injectorRepository.findByType(inject.getType());
        if (externalInjector.isPresent()) {
            return executeExternal(executableInject, inject);
        } else {
            return executeInternal(executableInject);
        }
    }

    // region utils
    private boolean isInInjectableRange(Injection injection) {
        Instant now = Instant.now();
        Instant start = now.minus(Duration.parse("PT1H"));
        Instant injectWhen = injection.getDate().orElseThrow();
        return injectWhen.isAfter(start) && injectWhen.isBefore(now);
    }
}
