package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
@Builder
public class InjectExecutionCallback {
  private String agentId;

  private String injectId;

  private InjectExecutionInput injectExecutionInput;
}
