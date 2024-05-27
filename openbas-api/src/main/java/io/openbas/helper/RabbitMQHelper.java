package io.openbas.helper;

import io.openbas.config.AppSecurityConfig;
import io.openbas.config.OpenBASConfig;
import io.openbas.config.RabbitmqConfig;
import org.springframework.boot.json.BasicJsonParser;
import org.springframework.http.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.logging.Level;
import java.util.logging.Logger;

public class RabbitMQHelper {

    private static final Logger LOGGER = Logger.getLogger(RabbitMQHelper.class.getName());

    private static String rabbitMQVersion;

    /**
     * Return the version of Rabbit MQ we're using
     *
     * @return the rabbit MQ version
     */
    public static String getRabbitMQVersion(RabbitmqConfig rabbitmqConfig) {
        // If we already have the version, we don't need to get it again
        if (rabbitMQVersion == null) {
            RestTemplate restTemplate = new RestTemplate();
            // Init the rabbit MQ management api overview url
            String uri = rabbitmqConfig.isSsl() ? "https://" : "http://"
                    + rabbitmqConfig.getHostname() + ":" + rabbitmqConfig.getManagementPort()
                    + "/api/overview";

            // Init the headers
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            headers.setBasicAuth(rabbitmqConfig.getUser(), rabbitmqConfig.getPass());
            HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

            // Make the call
            ResponseEntity<?> result = null;
            try {
                result = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            } catch (RestClientException e) {
                LOGGER.log(Level.SEVERE, e.getMessage(), e);
                return null;
            }

            // Init the parser to get the rabbit_mq version
            BasicJsonParser jsonParser = new BasicJsonParser();
            rabbitMQVersion = (String) jsonParser.parseMap((String) result.getBody()).get("rabbitmq_version");
        }

        return rabbitMQVersion;
    }
}
