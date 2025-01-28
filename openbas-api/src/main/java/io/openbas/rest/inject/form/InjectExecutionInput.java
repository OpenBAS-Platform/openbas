package io.openbas.rest.inject.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class InjectExecutionInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("execution_message")
  private String message;

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("execution_status")
  private String status;

  @JsonProperty("execution_duration")
  private int duration;

  @JsonProperty("execution_context_identifiers")
  private List<String> identifiers = new ArrayList<>();
}
