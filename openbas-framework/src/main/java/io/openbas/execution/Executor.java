package io.openbas.execution;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.openbas.database.model.Execution;
import io.openbas.database.model.Injection;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

import static io.openbas.database.model.ExecutionTrace.traceError;

@Component
public class Executor {

    @Resource
    protected ObjectMapper mapper;

    public Execution execute(ExecutableInject executableInject) {
        Execution execution = new Execution(executableInject.isRuntime());
        try {
            boolean isScheduledInject = !executableInject.isDirect();
            // If empty content, inject must be rejected
            if (executableInject.getInjection().getInject().getContent() == null) {
                throw new UnsupportedOperationException("Inject is empty");
            }
            // If inject is too old, reject the execution
            if (isScheduledInject && !isInInjectableRange(executableInject.getInjection())) {
                throw new UnsupportedOperationException("Inject is now too old for execution");
            }
            // 01. Push the execution to the target queue
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost("192.168.2.36");
            Connection connection = factory.newConnection();
            Channel channel = connection.createChannel();
            String jsonInject = mapper.writeValueAsString(executableInject);
            String routingKey = "openbas_push_routing_" + executableInject.getInjection().getInject().getType();
            channel.basicPublish("openbas_amqp.connector.exchange", routingKey, null, jsonInject.getBytes());
            // 02. Mark inject as "pushed"

            // // Process the execution
            // List<Expectation> expectations = process(execution, executableInject);
            // // Create the expectations
            // List<Team> teams = executableInject.getTeams();
            // List<Asset> assets = executableInject.getAssets();
            // List<AssetGroup> assetGroups = executableInject.getAssetGroups();
            // if (isScheduledInject && !expectations.isEmpty()) {
            //     if (!teams.isEmpty()) {
            //         List<InjectExpectation> injectExpectations = teams.stream()
            //             .flatMap(team -> expectations.stream()
            //                 .map(expectation -> expectationConverter(team, executableInject, expectation)))
            //             .toList();
            //         this.injectExpectationRepository.saveAll(injectExpectations);
            //     } else if (!assets.isEmpty() || !assetGroups.isEmpty()) {
            //         List<InjectExpectation> injectExpectations = expectations.stream()
            //             .map(expectation -> expectationConverter(executableInject, expectation))
            //             .toList();
            //         this.injectExpectationRepository.saveAll(injectExpectations);
            //     }
            // }
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
