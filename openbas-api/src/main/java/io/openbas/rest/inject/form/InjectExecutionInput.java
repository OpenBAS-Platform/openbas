package io.openbas.rest.inject.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InjectExecutionInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("execution_message") // FIXME: should be changed to execution_raw_output in implant repo
  private String message;

  @JsonProperty("execution_output_structured")
  private String outputStructured;

  @JsonProperty("execution_output_raw")
  private String outputRaw;

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("execution_status")
  private String status;

  @JsonProperty("execution_duration")
  private int duration;

  @JsonProperty("execution_action")
  private InjectExecutionAction action;
}
