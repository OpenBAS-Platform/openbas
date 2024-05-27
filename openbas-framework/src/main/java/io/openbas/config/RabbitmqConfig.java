package io.openbas.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openbas.rabbitmq")
@Data
public class RabbitmqConfig {

  @JsonProperty("rabbitmq_prefix")
  private String prefix;

  @JsonProperty("rabbitmq_hostname")
  private String hostname;

  @JsonProperty("rabbitmq_vhost")
  private String vhost;

  @JsonProperty("rabbitmq_ssl")
  private boolean ssl;

  @JsonProperty("rabbitmq_port")
  private int port;

  @JsonProperty("rabbitmq_management-port")
  private int managementPort;

  @JsonProperty("rabbitmq_user")
  private String user;

  @JsonProperty("rabbitmq_pass")
  private String pass;

  @JsonProperty("rabbitmq_queue-type")
  private String queueType;

}
