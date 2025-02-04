package io.openbas.rabbitmq.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QueueRegistration {

  @JsonProperty("connection")
  private QueueConnection connection;

  @JsonProperty("listen")
  private String listen;

  public QueueRegistration(QueueConnection connection, String listen) {
    this.connection = connection;
    this.listen = listen;
  }
}
