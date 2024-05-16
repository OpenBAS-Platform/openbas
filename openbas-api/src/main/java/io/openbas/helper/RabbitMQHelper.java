package io.openbas.helper;

import io.openbas.config.OpenBASConfig;
import org.springframework.boot.json.BasicJsonParser;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

public class RabbitMQHelper {

    private static String rabbitMQVersion;

    /**
     * Return the version of Rabbit MQ we're using
     *
     * @return the rabbit MQ version
     */
    public static String getRabbitMQVersion(OpenBASConfig openBASConfig) {
        // If we already have the version, we don't need to get it again
        if (rabbitMQVersion == null) {
            RestTemplate restTemplate = new RestTemplate();
            // Init the rabbit MQ management api overview url
            String uri = openBASConfig.isRabbitmqSsl() ? "https://" : "http://"
                    + openBASConfig.getRabbitmqHostname() + ":" + openBASConfig.getRabbitmqManagementPort()
                    + "/api/overview";

            // Init the headers
            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            headers.setBasicAuth(openBASConfig.getRabbitmqUser(), openBASConfig.getRabbitmqPass());
            HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

            // Make the call
            ResponseEntity<?> result =
                    restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

            // Init the parser to get the rabbit_mq version
            BasicJsonParser jsonParser = new BasicJsonParser();
            rabbitMQVersion = (String) jsonParser.parseMap((String) result.getBody()).get("rabbitmq_version");
        }

        return rabbitMQVersion;
    }
}
