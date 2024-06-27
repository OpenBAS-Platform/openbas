package io.openbas.rest.scenario.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
public class ImportMessage {
  public enum MessageLevel {
    CRITICAL,
    ERROR,
    WARN,
    INFO
  }

  @JsonProperty("message_level")
  private MessageLevel messageLevel;

  @JsonProperty("message_code")
  private String errorCode;

  @JsonProperty("message_params")
  private Map<String, String> params = null;

  public ImportMessage(MessageLevel level, String errorCode, Map<String, String> params) {
    this.messageLevel = level;
    this.errorCode = errorCode;
    this.params = params;
  }

  public ImportMessage(MessageLevel level, String errorCode) {
    this.messageLevel = level;
    this.errorCode = errorCode;
  }

}
