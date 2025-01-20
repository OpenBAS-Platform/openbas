package io.openbas.rest.exercise.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Builder(toBuilder = true)
@Data
public class CheckExerciseRulesOutput {
  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("rules_found")
  boolean rulesFound = false;
}
