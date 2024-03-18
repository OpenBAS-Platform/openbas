package io.openbas.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Inject;
import io.openbas.execution.ExecutableInject;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

@Service
public class QueueService {
    private static final String ROUTING_KEY = "_push_routing_";
    private static final String EXCHANGE_KEY = "_amqp.connector.exchange";

    @Resource
    protected ObjectMapper mapper;

    @Resource
    private OpenBASConfig openBASConfig;

    public void publish(String injectType, String publishedJson) throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(openBASConfig.getRabbitmqHostname());
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();
        String jsonInject = mapper.writeValueAsString(publishedJson);
        String routingKey = openBASConfig.getRabbitmqPrefix() + ROUTING_KEY + injectType;
        String exchangeKey = openBASConfig.getRabbitmqPrefix() + EXCHANGE_KEY;
        channel.basicPublish(exchangeKey, routingKey, null, publishedJson.getBytes());
    }
}
