package io.openbas.execution;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.openbas.database.model.Injector;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.database.repository.InjectorRepository;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.TimeoutException;

import static io.openbas.database.model.ExecutionTrace.traceError;

@Component
public class Executor {

    @Resource
    protected ObjectMapper mapper;

    private ApplicationContext context;

    private InjectStatusRepository injectStatusRepository;

    private InjectorRepository injectorRepository;

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

    private Execution executeExternal(ExecutableInject executableInject) throws IOException, TimeoutException {
        Inject inject = executableInject.getInjection().getInject();
        // 01. Push the execution to the target queue
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("192.168.2.36");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();
        String jsonInject = mapper.writeValueAsString(executableInject);
        String routingKey = "openbas_push_routing_" + inject.getType();
        InjectStatus status = new InjectStatus();
        status.setTrackingSentDate(Instant.now());
        status.setInject(inject);
        InjectStatus savedStatus = injectStatusRepository.save(status);
        try {
            channel.basicPublish("openbas_amqp.connector.exchange", routingKey, null, jsonInject.getBytes());
        } catch (Exception e) {
            injectStatusRepository.delete(savedStatus);
        }
        return new Execution();
    }

    private Execution executeInternal(ExecutableInject executableInject) {
        Inject inject = executableInject.getInjection().getInject();
        io.openbas.execution.Injector executor = this.context.getBean(inject.getType(), io.openbas.execution.Injector.class);
        return executor.executeInjection(executableInject);
    }

    public Execution execute(ExecutableInject executableInject) {
        Execution execution = new Execution(executableInject.isRuntime());
        try {
            boolean isScheduledInject = !executableInject.isDirect();
            // If empty content, inject must be rejected
            Inject inject = executableInject.getInjection().getInject();
            if (inject.getContent() == null) {
                throw new UnsupportedOperationException("Inject is empty");
            }
            // If inject is too old, reject the execution
            if (isScheduledInject && !isInInjectableRange(executableInject.getInjection())) {
                throw new UnsupportedOperationException("Inject is now too old for execution");
            }
            // Depending on injector type (internal or external) execution must be done differently
            Optional<Injector> externalInjector = injectorRepository.findByType(inject.getType());
            if (externalInjector.isPresent()) {
                return executeExternal(executableInject);
            } else {
                return executeInternal(executableInject);
            }
        } catch (Exception e) {
            execution.addTrace(traceError(getClass().getSimpleName(), e.getMessage(), e));
        } finally {
            execution.stop();
        }
        return execution;
    }

    // region utils
    private boolean isInInjectableRange(Injection injection) {
        Instant now = Instant.now();
        Instant start = now.minus(Duration.parse("PT1H"));
        Instant injectWhen = injection.getDate().orElseThrow();
        return injectWhen.isAfter(start) && injectWhen.isBefore(now);
    }
}
