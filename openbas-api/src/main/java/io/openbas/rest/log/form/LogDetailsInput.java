package io.openbas.rest.log.form;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogDetailsInput {

  @Schema(name = "message", type = "string", description = "The log message", example = "An informational message")
  private String message;

  @Schema(name = "stack", type = "string", description = "The stacktrace associated with the log message", example = "Stacktrace here")
  private String stack;

  @Schema(name = "level", type = "string", description = "The log level (INFO, WARN, DEBUG, ERROR)", example = "INFO")
  private String level;
}
