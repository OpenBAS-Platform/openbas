package io.openbas.rest.scenario.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ImportMessage {
  public enum MessageLevel {
    INFO,
    WARN,
    ERROR
  }

  @JsonProperty("message_level")
  private MessageLevel messageLevel;

  @JsonProperty("message")
  private String message;

  public ImportMessage(MessageLevel level, String message) {
    this.messageLevel = level;
    this.message = message;
  }

}
